/**
 * ============================================================
 * SOFTTUULS FISCAL AGENT v1.0
 * ============================================================
 * Micro-servidor local que actúa como puente entre la App Web
 * de Softtuuls (Nuxt) y la impresora fiscal física conectada
 * por USB/Serial (Bixolon, PNP, Aclas, genéricas ESC/POS).
 *
 * La app web envía un POST JSON a http://localhost:4040/print
 * y este agente traduce los datos a comandos ESC/POS y los
 * envía directamente por el puerto serial/USB al hardware.
 *
 * INSTRUCCIONES:
 * 1. npm install
 * 2. Conectar la impresora fiscal por USB
 * 3. Configurar el puerto COM en config.json (ej: COM3, /dev/ttyUSB0)
 * 4. node server.js
 * ============================================================
 */

const express = require('express')
const cors = require('cors')
const { SerialPort } = require('serialport')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 4040

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*' })) // Only listens on localhost anyway
app.use(express.json({ limit: '5mb' }))

// ── Configuration ──────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'config.json')
let config = {
    serialPort: 'COM3',        // Default Windows port
    baudRate: 9600,
    printerWidth: 48,          // Characters per line (80mm = 48, 58mm = 32)
    businessName: 'Mi Negocio',
    rif: 'J-00000000-0',
    address: '',
    phone: '',
    footer: 'Gracias por su compra'
}

// Load config from file if it exists
if (fs.existsSync(CONFIG_PATH)) {
    try {
        const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
        config = { ...config, ...loaded }
        console.log('✅ Configuración cargada desde config.json')
    } catch (e) {
        console.warn('⚠️  Error leyendo config.json, usando valores por defecto.')
    }
} else {
    // Create default config file
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
    console.log('📝 config.json creado con valores por defecto. Edítelo para configurar su impresora.')
}

// ── ESC/POS Command Builders ───────────────────────────────
const ESC = {
    INIT:       Buffer.from([0x1B, 0x40]),                    // Initialize printer
    BOLD_ON:    Buffer.from([0x1B, 0x45, 0x01]),              // Bold on
    BOLD_OFF:   Buffer.from([0x1B, 0x45, 0x00]),              // Bold off
    CENTER:     Buffer.from([0x1B, 0x61, 0x01]),              // Center align
    LEFT:       Buffer.from([0x1B, 0x61, 0x00]),              // Left align
    RIGHT:      Buffer.from([0x1B, 0x61, 0x02]),              // Right align
    DOUBLE_H:   Buffer.from([0x1D, 0x21, 0x01]),              // Double height
    NORMAL:     Buffer.from([0x1D, 0x21, 0x00]),              // Normal size
    CUT:        Buffer.from([0x1D, 0x56, 0x00]),              // Full cut
    PARTIAL_CUT:Buffer.from([0x1D, 0x56, 0x01]),              // Partial cut
    FEED_3:     Buffer.from([0x1B, 0x64, 0x03]),              // Feed 3 lines
    FEED_5:     Buffer.from([0x1B, 0x64, 0x05]),              // Feed 5 lines
    DRAWER:     Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]),  // Open cash drawer
}

const text = (str) => Buffer.from(str + '\n', 'latin1')
const line = (char = '-', width = config.printerWidth) => Buffer.from(char.repeat(width) + '\n', 'latin1')

// Pad columns: left-aligned text + right-aligned number
const columns = (left, right, width = config.printerWidth) => {
    const maxLeft = width - right.length - 1
    const paddedLeft = left.substring(0, maxLeft).padEnd(maxLeft)
    return Buffer.from(paddedLeft + ' ' + right + '\n', 'latin1')
}

// ── Build Receipt Buffer ───────────────────────────────────
function buildReceipt(sale) {
    const buffers = []
    const push = (b) => buffers.push(b)

    // Initialize
    push(ESC.INIT)

    // ── Header ──
    push(ESC.CENTER)
    push(ESC.BOLD_ON)
    push(ESC.DOUBLE_H)
    push(text(config.businessName.toUpperCase()))
    push(ESC.NORMAL)
    push(ESC.BOLD_OFF)
    push(text(`RIF: ${config.rif}`))
    if (config.address) push(text(config.address))
    if (config.phone) push(text(`Tel: ${config.phone}`))
    push(ESC.LEFT)
    push(line('='))

    // ── Document Info ──
    const docType = sale.document_type === 'credit_note' ? 'NOTA DE CREDITO'
        : sale.document_type === 'delivery_note' ? 'NOTA DE ENTREGA'
        : 'FACTURA'

    push(ESC.CENTER)
    push(ESC.BOLD_ON)
    push(text(docType))
    push(ESC.BOLD_OFF)
    push(ESC.LEFT)

    push(text(`Nro Control: ${sale.control_number || 'N/A'}`))
    push(text(`Fecha: ${new Date(sale.date || sale.created_at).toLocaleString('es-VE')}`))

    if (sale.client_name) {
        push(text(`Cliente: ${sale.client_name}`))
    }
    if (sale.client_rif) {
        push(text(`RIF/CI: ${sale.client_rif}`))
    }

    push(line('-'))

    // ── Items ──
    push(ESC.BOLD_ON)
    push(columns('DESCRIPCION', 'TOTAL'))
    push(ESC.BOLD_OFF)
    push(line('-'))

    const items = sale.items || sale.items_snapshot || []
    items.forEach(item => {
        const name = item.name || item.product_name || 'Producto'
        const qty = item.quantity || 1
        const price = Number(item.price || item.price_at_transaction || 0)
        const total = (qty * price).toFixed(2)
        const currency = sale.currency === 'VES' ? 'Bs' : '$'

        push(text(`${qty}x ${name}`))
        push(columns('', `${currency}${total}`))
    })

    push(line('='))

    // ── Totals ──
    const currency = sale.currency === 'VES' ? 'Bs' : '$'

    if (sale.exempt_amount > 0) {
        push(columns('Exento:', `${currency}${Number(sale.exempt_amount).toFixed(2)}`))
    }
    if (sale.tax_base > 0) {
        push(columns('Base Imp. (16%):', `${currency}${Number(sale.tax_base).toFixed(2)}`))
    }
    if (sale.tax_reduced_amount > 0) {
        push(columns('IVA (8%):', `${currency}${Number(sale.tax_reduced_amount).toFixed(2)}`))
    }
    if (sale.tax_luxury_amount > 0) {
        push(columns('IVA (31%):', `${currency}${Number(sale.tax_luxury_amount).toFixed(2)}`))
    }
    if (sale.tax_igtf > 0) {
        push(columns('IGTF (3%):', `${currency}${Number(sale.tax_igtf).toFixed(2)}`))
    }

    push(line('-'))
    push(ESC.BOLD_ON)
    push(columns('TOTAL:', `${currency}${Number(sale.amount).toFixed(2)}`))
    push(ESC.BOLD_OFF)

    // Payment method
    if (sale.payment_method) {
        const methods = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            mobile_pay: 'Pago Móvil',
            transfer: 'Transferencia',
            mixed: 'Pago Mixto'
        }
        push(text(`Método: ${methods[sale.payment_method] || sale.payment_method}`))
    }
    if (sale.payment_reference) {
        push(text(`Ref: ${sale.payment_reference}`))
    }

    // Exchange rate
    if (sale.exchange_rate && sale.exchange_rate > 1) {
        push(text(`Tasa BCV: ${Number(sale.exchange_rate).toFixed(4)}`))
    }

    push(line('-'))

    // ── Footer ──
    push(ESC.CENTER)
    push(text(config.footer))
    push(text('Softtuuls POS'))
    push(text(new Date().toLocaleDateString('es-VE')))
    push(ESC.LEFT)

    // Feed and cut
    push(ESC.FEED_5)
    push(ESC.PARTIAL_CUT)

    return Buffer.concat(buffers)
}

// ── Routes ─────────────────────────────────────────────────

// Health check
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        agent: 'Softtuuls Fiscal Agent v1.0',
        port: config.serialPort,
        baudRate: config.baudRate,
        timestamp: new Date().toISOString()
    })
})

// List available serial ports
app.get('/ports', async (req, res) => {
    try {
        const ports = await SerialPort.list()
        res.json({ ports })
    } catch (e) {
        res.status(500).json({ error: 'Error listing ports', detail: e.message })
    }
})

// Update configuration
app.post('/config', (req, res) => {
    try {
        config = { ...config, ...req.body }
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
        res.json({ status: 'ok', config })
    } catch (e) {
        res.status(500).json({ error: 'Could not save config', detail: e.message })
    }
})

// 🖨️ PRINT INVOICE
app.post('/print', async (req, res) => {
    const sale = req.body

    if (!sale || !sale.amount) {
        return res.status(400).json({ error: 'Invalid sale data' })
    }

    console.log(`\n🖨️  Imprimiendo ${sale.document_type || 'invoice'} #${sale.control_number || sale.id}...`)

    try {
        const receiptBuffer = buildReceipt(sale)

        const port = new SerialPort({
            path: config.serialPort,
            baudRate: config.baudRate,
            autoOpen: false
        })

        await new Promise((resolve, reject) => {
            port.open((err) => {
                if (err) return reject(err)

                port.write(receiptBuffer, (writeErr) => {
                    if (writeErr) return reject(writeErr)

                    port.drain((drainErr) => {
                        port.close()
                        if (drainErr) return reject(drainErr)
                        resolve()
                    })
                })
            })
        })

        console.log('✅ Impresión exitosa.')
        res.json({ status: 'printed', control_number: sale.control_number })

    } catch (e) {
        console.error('❌ Error de impresión:', e.message)
        res.status(500).json({
            error: 'Print failed',
            detail: e.message,
            hint: `Verifique que la impresora esté conectada en ${config.serialPort} y encendida.`
        })
    }
})

// 💰 Open Cash Drawer
app.post('/open-drawer', async (req, res) => {
    try {
        const port = new SerialPort({
            path: config.serialPort,
            baudRate: config.baudRate,
            autoOpen: false
        })

        await new Promise((resolve, reject) => {
            port.open((err) => {
                if (err) return reject(err)
                port.write(ESC.DRAWER, (writeErr) => {
                    port.drain(() => { port.close(); resolve() })
                })
            })
        })

        res.json({ status: 'drawer_opened' })
    } catch (e) {
        res.status(500).json({ error: 'Drawer failed', detail: e.message })
    }
})

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║     SOFTTUULS FISCAL AGENT v1.0                   ║
║     Escuchando en http://localhost:${PORT}          ║
║     Puerto Impresora: ${config.serialPort.padEnd(27)}║
║     Baud Rate: ${String(config.baudRate).padEnd(33)}║
╚═══════════════════════════════════════════════════╝
    `)
    console.log('Esperando órdenes de impresión desde Softtuuls Web...\n')
})
