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
                    @click="exportExcel"
                    :disabled="loading || transactions.length === 0"
                    class="btn variant-primary px-4 py-2 flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Exportar a Excel (.xlsx)
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
                    <!-- <option value="purchases">Libro de Compras</option> Para el futuro -->
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

watch([filterMonth, () => organization.value?.id], fetchLedger)

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
            "Nro. Op.": index + 1,
            "Fecha": new Date(t.date).toLocaleDateString('es-VE'),
            "RIF / C.I.": t.client?.identity_document || 'V000000000',
            "Nombre / Razón Social": t.client?.name || 'Consumidor Final',
            "Tipo Doc.": t.document_type === 'credit_note' ? 'NC' : (t.document_type === 'delivery_note' ? 'NE' : 'Fac'),
            "Nro. Comprobante": t.control_number || t.id.slice(0, 8),
            "Factura Afectada": t.document_type === 'credit_note' && t.related_transaction_id ? t.related_transaction_id.slice(0, 8) : '',
            "Total Venta c/IVA": Number(t.amount || 0),
            "Ventas Exentas": Number(t.exempt_amount || 0),
            "Base Imponible (16%)": Number(t.tax_base || 0),
            "Impuesto IVA (16%)": Number(t.tax_general_amount || 0),
            "Base IGTF Divisas": Number(t.payment_details?.igtf_base || 0),
            "IGTF Percibido": Number(t.tax_igtf || 0)
        }
    })

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    
    // Auto-adjust column width (Basic Approach)
    const wscols = [
        { wch: 8 },  // Op
        { wch: 12 }, // Fecha
        { wch: 15 }, // RIF
        { wch: 30 }, // Nombre
        { wch: 10 }, // Tipo
        { wch: 18 }, // Ctrl
        { wch: 18 }, // Factura afect.
        { wch: 18 }, // Total
        { wch: 18 }, // Exento
        { wch: 18 }, // Base 16
        { wch: 18 }, // IVA 16
        { wch: 18 }, // Base IGTF
        { wch: 18 }  // IGTF
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Ventas_${filterMonth.value}`)

    // Download file
    XLSX.writeFile(workbook, `Libro_Ventas_Softtuuls_${filterMonth.value}.xlsx`)
}
</script>
