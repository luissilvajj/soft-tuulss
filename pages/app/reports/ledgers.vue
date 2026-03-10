<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-heading">Libros Contables</h1>
                <p class="text-sm text-text-secondary mt-1">Generación y exportación de Libros de Compra y Venta (SENIAT).</p>
            </div>
            
            <div class="flex gap-3">
                 <button 
                    @click="ledgerType === 'purchases' ? exportPurchasesExcel() : exportExcel()"
                    :disabled="loading || transactions.length === 0"
                    class="btn variant-primary px-4 py-2 flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Exportar a Excel (.xlsx)
                </button>
                <button 
                    @click="exportTXT"
                    :disabled="loading || transactions.length === 0"
                    class="btn bg-surface-subtle text-text-heading border border-surface-border hover:bg-surface-ground px-4 py-2 flex items-center gap-2 transition-colors"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Declaración TXT (Pórtico)
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-surface-ground p-4 rounded-xl border border-surface-border flex gap-4 items-end">
            <div class="flex-1">
                <label class="block text-xs font-medium text-text-secondary mb-1">Periodo Impositivo (Mes)</label>
                <input type="month" v-model="filterMonth" class="bg-surface-subtle border border-surface-border text-text-heading text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
            </div>
            <div class="flex-1">
                <label class="block text-xs font-medium text-text-secondary mb-1">Tipo de Libro</label>
                <select v-model="ledgerType" class="bg-surface-subtle border border-surface-border text-text-heading text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="sales">Libro de Ventas</option>
                    <option value="purchases">Libro de Compras</option>
                </select>
            </div>
        </div>

        <!-- Warning Note about Official Format -->
        <div class="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-primary-800">
                        Los montos mostrados en estos Libros base están expresados en su divisa original (USD) o la moneda de la transacción. El archivo Excel exportado está formateado automáticamente con montos totalizados y bases desglosadas (Exento, General, Reducido e IGTF) respetando la correlatividad estricta exigida en Providencias para la declaración fiscal.
                    </p>
                </div>
            </div>
        </div>

        <!-- Table Preview -->
        <div class="bg-surface-ground rounded-xl shadow-sm border border-surface-border overflow-hidden">
            <div class="overflow-x-auto text-sm">
                <table class="w-full text-left">
                    <thead class="bg-surface-subtle text-text-secondary font-medium tracking-wider text-xs uppercase border-b border-surface-border">
                        <tr>
                            <th class="px-6 py-4 whitespace-nowrap">Fecha</th>
                            <th class="px-6 py-4 whitespace-nowrap">Tipo Doc</th>
                            <th class="px-6 py-4 whitespace-nowrap">Factura/Control</th>
                            <th class="px-6 py-4 whitespace-nowrap">Identificación (RIF/Cédula)</th>
                            <th class="px-6 py-4 whitespace-nowrap">Nombre Razón Social</th>
                            <th class="px-6 py-4 text-right whitespace-nowrap">Total Venta</th>
                            <th class="px-6 py-4 text-right whitespace-nowrap">Ventas Exentas</th>
                            <th class="px-6 py-4 text-right whitespace-nowrap">Base IVA (16%)</th>
                            <th class="px-6 py-4 text-right whitespace-nowrap">Impuesto IVA</th>
                            <th class="px-6 py-4 text-right whitespace-nowrap">Base IGTF (Divisa)</th>
                            <th class="px-6 py-4 text-right whitespace-nowrap">Impuesto IGTF</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                        <tr v-if="loading">
                             <td colspan="11" class="px-6 py-8 text-center text-text-secondary">
                                 <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 Cargando transacciones...
                             </td>
                        </tr>
                        <tr v-else-if="transactions.length === 0">
                             <td colspan="11" class="px-6 py-8 text-center text-text-secondary">
                                 No hay documentos fiscales emitidos en este periodo.
                             </td>
                        </tr>
                        <tr v-for="t in transactions" :key="t.id" class="hover:bg-surface-subtle transition-colors">
                            <td class="px-6 py-4 font-mono">{{ new Date(t.date).toLocaleDateString('es-VE') }}</td>
                            <td class="px-6 py-4 capitalize font-semibold">
                                <span :class="t.document_type === 'delivery_note' ? 'text-text-secondary' : 'text-primary-600'">
                                    {{ t.document_type === 'delivery_note' ? 'Nota Entrega' : 'Factura' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-mono">{{ t.control_number || t.id.split('-')[0] }}</td>
                            <td class="px-6 py-4">{{ t.client?.identity_document || 'V/E' }}</td>
                            <td class="px-6 py-4 truncate max-w-[150px]">{{ t.client?.name || 'Consumidor Final' }}</td>
                            <td class="px-6 py-4 text-right font-bold text-text-heading">{{ formatMoney(t.amount, t.currency) }}</td>
                            <td class="px-6 py-4 text-right">
                                {{ t.exempt_amount > 0 ? formatMoney(t.exempt_amount, t.currency) : '-' }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                {{ t.tax_base > 0 ? formatMoney(t.tax_base, t.currency) : '-' }}
                            </td>
                            <td class="px-6 py-4 text-right font-medium">
                                {{ t.tax_general_amount > 0 ? formatMoney(t.tax_general_amount, t.currency) : '-' }}
                            </td>
                             <td class="px-6 py-4 text-right">
                                {{ t.payment_details?.igtf_base > 0 ? formatMoney(t.payment_details.igtf_base, 'USD') : '-' }}
                            </td>
                            <td class="px-6 py-4 text-right font-medium text-emerald-600">
                                {{ t.tax_igtf > 0 ? formatMoney(t.tax_igtf, t.currency) : '-' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSupabaseClient, definePageMeta } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import { usePermissions } from '~/composables/usePermissions'
import * as XLSX from 'xlsx'

definePageMeta({
    layout: 'authenticated',
    middleware: 'admin-auth'
})

const client = useSupabaseClient()
const { organization } = useOrganization()
const { isAdmin, canViewFinancials } = usePermissions()

// Date handling: default to current year-month (YYYY-MM)
const currDate = new Date()
const filterMonth = ref(`${currDate.getFullYear()}-${String(currDate.getMonth() + 1).padStart(2, '0')}`)
const ledgerType = ref('sales')

const loading = ref(false)
const transactions = ref<any[]>([])

const formatMoney = (val: number, currency: string) => {
    return `${currency === 'VES' ? 'Bs' : '$'}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fetchLedger = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const [year, month] = filterMonth.value.split('-')
        const startDate = `${year}-${month}-01`
        let nextMonth = parseInt(month) + 1
        let nextYear = parseInt(year)
        if (nextMonth > 12) {
            nextMonth = 1
            nextYear++
        }
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

        const { data, error } = await client
            .from('transactions')
            .select('*, client:clients(name, identity_document)')
            .eq('organization_id', organization.value.id)
            .in('type', ['sale', 'credit_note', 'debit_note'])
            .gte('date', startDate)
            .lt('date', endDate)
            .order('invoice_number', { ascending: true }) // Order functionally by the sequence

        if (error) throw error
        transactions.value = data || []

    } catch (e: any) {
        console.error('Error fetching ledger:', e)
    } finally {
        loading.value = false
    }
}

const fetchPurchaseLedger = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const [year, month] = filterMonth.value.split('-')
        const startDate = `${year}-${month}-01`
        let nextMonth = parseInt(month) + 1
        let nextYear = parseInt(year)
        if (nextMonth > 12) { nextMonth = 1; nextYear++ }
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

        const { data, error } = await client
            .from('purchases')
            .select('*, supplier:suppliers(name, rif)')
            .eq('organization_id', organization.value.id)
            .gte('date', startDate)
            .lt('date', endDate)
            .order('date', { ascending: true })

        if (error) throw error
        transactions.value = data || []
    } catch (e: any) {
        console.error('Error fetching purchase ledger:', e)
    } finally {
        loading.value = false
    }
}

watch([filterMonth, ledgerType, () => organization.value?.id], () => {
    if (ledgerType.value === 'purchases') fetchPurchaseLedger()
    else fetchLedger()
})

onMounted(() => {
    if (canViewFinancials.value) {
        fetchLedger()
    }
})

// === EXCEL EXPORT LOGIC ===
const exportExcel = () => {
    if (transactions.value.length === 0) return

    // Transform API objects into Worksheet format
    const worksheetData = transactions.value.map((t, index) => {
        return {
            "Número de Operación": index + 1,
            "Fecha de la Factura": new Date(t.date).toLocaleDateString('es-VE'),
            "RIF": t.client?.identity_document || 'V000000000',
            "Nombre o Razón Social": t.client?.name || 'Consumidor Final',
            "Número de Factura": t.id.slice(0, 8),
            "Número de Control": t.control_number || t.id.slice(0, 8),
            "Total de Ventas con IVA": Number(t.amount || 0),
            "Ventas Exentas": Number(t.exempt_amount || 0),
            "Base Imponible": Number(t.tax_base || 0),
            "Impuesto IVA": Number(t.tax_general_amount || t.tax_reduced_amount || 0),
            "IVA Retenido": 0, // Por ahora 0 hasta integrar modulo de comprobantes
            "IGTF Percibido": Number(t.tax_igtf || 0)
        }
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    
    // Auto-adjust column width
    const wscols = [
        { wch: 20 }, // Num Op
        { wch: 18 }, // Fecha
        { wch: 16 }, // RIF
        { wch: 35 }, // Nombre
        { wch: 18 }, // Num Fac
        { wch: 18 }, // Num Control
        { wch: 22 }, // Total Ventas
        { wch: 18 }, // Exentas
        { wch: 18 }, // Base 
        { wch: 15 }, // IVA
        { wch: 15 }, // Retenido
        { wch: 15 }  // IGTF
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Ventas_${filterMonth.value}`)

    // Download file
    const bookType = ledgerType.value === 'purchases' ? 'Compras' : 'Ventas'
    XLSX.writeFile(workbook, `Libro_${bookType}_Softtuuls_${filterMonth.value}.xlsx`)
}

const exportPurchasesExcel = () => {
    if (transactions.value.length === 0) return
    const worksheetData = transactions.value.map((t: any, index: number) => ({
        "Número de Operación": index + 1,
        "Fecha de la Factura": new Date(t.date).toLocaleDateString('es-VE'),
        "RIF": t.supplier?.rif || 'V000000000',
        "Nombre o Razón Social": t.supplier?.name || 'Sin Nombre',
        "Número de Factura": t.invoice_number || '-',
        "Número de Control": t.control_number || '-',
        "Total de Compras con IVA": Number(t.total || 0),
        "Compras Exentas": Number(t.exempt_amount || 0),
        "Base Imponible": Number(t.tax_base || 0),
        "Impuesto IVA": Number(t.tax_amount || 0),
        "IVA Retenido": 0, // Placeholder
        "IGTF Percibido": Number(t.igtf_amount || 0)
    }))
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    // Usamos el mismo patrón de ancho que ventas
    worksheet['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Compras_${filterMonth.value}`)
    XLSX.writeFile(workbook, `Libro_Compras_Softtuuls_${filterMonth.value}.xlsx`)
}

// === TXT EXPORT LOGIC FOR SENIAT PORTAL ===
const exportTXT = () => {
    if (transactions.value.length === 0) return

    let txtContent = ''
    
    // El SENIAT tiene un formato tubular de campos separados por tabulador.
    // Asumiremos la siguiente estructura: 
    // RIF_EMPRESA | FECHA | NUM_FAC | NUM_CTRL | TIPO_DOC | RIF_CLIENTE | TOTAL | EXENTO | BASE | IVA | IGTF
    
    // Por ahora (Fase 19) usaremos un prototipo TXT general como prueba base
    const myRif = organization.value?.identity_document || 'J000000000'

    transactions.value.forEach((t) => {
        const dateObj = new Date(t.date)
        const day = String(dateObj.getDate()).padStart(2, '0')
        const mon = String(dateObj.getMonth() + 1).padStart(2, '0')
        const yyyy = dateObj.getFullYear()
        
        const fechaFormat = `${day}/${mon}/${yyyy}` // Formato SENIAT dd/mm/yyyy

        const clientRif = (ledgerType.value === 'purchases' ? t.supplier?.rif : t.client?.identity_document) || 'V000000000'
        
        let tipoDocumento = '01' // 01 = Factura, 02 = Nota de Debito, 03 = Nota de Credito
        if(t.document_type === 'credit_note') tipoDocumento = '03'
        if(t.document_type === 'debit_note') tipoDocumento = '02'

        const nroFactura = t.invoice_number || t.id.split('-')[0]
        const nroControl = t.control_number || nroFactura
        const total = (ledgerType.value === 'purchases' ? t.total : t.amount) || '0.00'
        const base = t.tax_base || '0.00'
        const iva = (ledgerType.value === 'purchases' ? t.tax_amount : (t.tax_general_amount || t.tax_reduced_amount)) || '0.00'

        // Armamos la fila concatenada por tabulador \t
        const row = [myRif, fechaFormat, nroFactura, nroControl, tipoDocumento, clientRif, Number(total).toFixed(2), Number(base).toFixed(2), Number(iva).toFixed(2)].join('\t')
        
        txtContent += row + '\n'
    })

    // Construir Blob y descargarlo artificialmente
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Declaracion_${ledgerType.value.toUpperCase()}_${filterMonth.value}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
</script>
