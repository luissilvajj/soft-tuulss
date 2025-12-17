import { createHmac } from 'crypto'

interface BancoPlazaConfig {
    apiKey: string
    apiSecret: string
    baseUrl: string
    rif: string
    account: string
}

export class BancoPlazaClient {
    private config: BancoPlazaConfig

    constructor(config?: Partial<BancoPlazaConfig>) {
        this.config = {
            apiKey: config?.apiKey || process.env.BANCO_PLAZA_API_KEY || '',
            apiSecret: config?.apiSecret || process.env.BANCO_PLAZA_API_SECRET || '',
            baseUrl: config?.baseUrl || process.env.BANCO_PLAZA_URL || 'https://api.bancoplaza.com:8282',
            rif: config?.rif || process.env.BANCO_PLAZA_ID || '',
            account: config?.account || process.env.BANCO_PLAZA_ACCOUNT || ''
        }
    }

    private generateSignature(path: string, nonce: string, body: any): string {
        const payload = path + nonce + (body ? JSON.stringify(body) : '')
        return createHmac('sha384', this.config.apiSecret)
            .update(payload)
            .digest('hex')
    }

    /**
     * MOCK Mode:
     * El usuario pidió simular el proceso sin credenciales reales todavía.
     * Regla: Si el teléfono es "04241672737" -> Éxito, si no -> Error.
     */
    async verifyPagoMovil(data: { reference: string, date: string, amount: number, phone: string }): Promise<boolean> {
        console.log('--- Verificando Pago Móvil (MOCK) ---')
        console.log('Datos:', data)

        // Simulación de latencia de red
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Regla de Mock del Usuario
        if (data.phone === '04241672737' || data.phone === '0424-1672737' || data.phone === '04241672737') {
            console.log('✅ Pago Simulado EXITOSO')
            return true
        }

        console.log('❌ Pago Simulado FALLIDO')
        return false
    }

    async verifyTransferencia(data: { reference: string, date: string, amount: number }): Promise<boolean> {
        console.log('--- Verificando Transferencia (MOCK) ---')
        // Misma lógica de mock, podríamos usar la referencia para decidir
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Si la referencia termina en '777' es éxito
        if (data.reference.endsWith('777')) {
            return true
        }

        return false
    }
}
