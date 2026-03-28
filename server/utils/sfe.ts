import { createHmac } from 'crypto'

/**
 * Genera el Código Único de Factura Electrónica (CUFE)
 * Requisito indispensable para la validación fiscal del SENIAT.
 */
export const generateCUFE = (data: {
    rifEmisor: string,
    numeroFactura: string,
    numeroControl: string,
    fecha: string,
    montoTotal: number,
    montoIVA: number,
    rifReceptor: string
}) => {
    // El secreto debería venir de variables de entorno (SFE_SECRET_KEY)
    const secret = process.env.SFE_SECRET_KEY || 'softtuuls_demo_secret_2026'
    
    // Cadena de concatenación estandarizada
    const chain = [
        data.rifEmisor.replace(/[^a-zA-Z0-9]/g, ''),
        data.numeroFactura.padStart(10, '0'),
        data.numeroControl.padStart(10, '0'),
        data.fecha.replace(/[^0-9]/g, ''),
        data.montoTotal.toFixed(2).replace('.', ''),
        data.montoIVA.toFixed(2).replace('.', ''),
        data.rifReceptor.replace(/[^a-zA-Z0-9]/g, '') || 'J000000000'
    ].join('|')

    return createHmac('sha256', secret)
        .update(chain)
        .digest('hex')
        .toUpperCase()
}

/**
 * Genera la URL para el código QR de validación fiscal
 */
export const generateQRData = (cufe: string, rifEmisor: string) => {
    const baseUrl = 'https://sfe.seniat.gob.ve/consulta/factura'
    return `${baseUrl}?rif=${rifEmisor}&cufe=${cufe}`
}
