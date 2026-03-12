<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-heading">Comprobantes de Retención</h1>
                <p class="text-sm text-text-secondary mt-1">Control de retenciones de IVA (75%/100%) e ISLR aplicadas.</p>
            </div>
            
            <div class="flex gap-3">
                 <button 
                    @click="exportExcel"
                    :disabled="loading || retentions.length === 0"
                    class="btn variant-primary px-4 py-2 flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Exportar Relación A/R (.xlsx)
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-surface-ground p-4 rounded-xl border border-surface-border flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-text-secondary mb-1">Periodo (Mes)</label>
                <input type="month" v-model="filterMonth" class="bg-surface-subtle border border-surface-border text-text-heading text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-text-secondary mb-1">Tipo de Retención</label>
                <select v-model="filterType" class="bg-surface-subtle border border-surface-border text-text-heading text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                    <option value="all">Todas</option>
                    <option value="iva">Solo IVA</option>
                    <option value="islr">Solo ISLR</option>
                </select>
            </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div class="bg-surface-ground p-4 rounded-xl border border-surface-border">
                <p class="text-xs font-bold text-text-secondary uppercase">Total Retenciones Acumuladas</p>
                <p class="text-2xl font-bold text-text-heading mt-2 font-mono">${{ totalAcumulado.toFixed(2) }}</p>
             </div>
             <div class="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <p class="text-xs font-bold text-emerald-600 uppercase">Acumulado IVA</p>
                <p class="text-2xl font-bold text-emerald-700 mt-2 font-mono">${{ totalIva.toFixed(2) }}</p>
             </div>
             <div class="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <p class="text-xs font-bold text-blue-600 uppercase">Acumulado ISLR</p>
                <p class="text-2xl font-bold text-blue-700 mt-2 font-mono">${{ totalIslr.toFixed(2) }}</p>
             </div>
        </div>

        <!-- Table Preview -->
        <div class="bg-surface-ground rounded-xl shadow-sm border border-surface-border overflow-hidden">
            <div class="overflow-x-auto text-sm">
                <table class="w-full text-left">
                    <thead class="bg-surface-subtle text-text-secondary font-medium tracking-wider text-xs uppercase border-b border-surface-border">
                        <tr>
                            <th class="px-6 py-4 whitespace-nowrap">Fecha Trans.</th>
                            <th class="px-6 py-4 whitespace-nowrap">Tipo</th>
                            <th class="px-6 py-4 whitespace-nowrap">Comprobante Nro.</th>
                            <th class="px-6 py-4 whitespace-nowrap">Documento Asoc.</th>
                            <th class="px-6 py-4 whitespace-nowrap">Cliente</th>
                            <th class="px-6 py-4 whitespace-nowrap text-right">%</th>
                            <th class="px-6 py-4 whitespace-nowrap text-right">Monto Retenido</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                        <tr v-if="loading">
                             <td colspan="7" class="px-6 py-8 text-center text-text-secondary">
                                 <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 Cargando retenciones...
                             </td>
                        </tr>
                        <tr v-else-if="filteredRetentions.length === 0">
                             <td colspan="7" class="px-6 py-8 text-center text-text-secondary bg-surface-ground">
                                 No hay comprobantes de retención asentados en este periodo.
                             </td>
                        </tr>
                        <tr v-for="r in filteredRetentions" :key="`${r.transaction_id}-${r.type}`" class="hover:bg-surface-subtle transition-colors">
                            <td class="px-6 py-4 font-mono">{{ new Date(r.transaction?.created_at || r.created_at).toLocaleDateString() }}</td>
                            <td class="px-6 py-4 font-bold">
                                <span :class="[
                                    'px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider',
                                    r.type === 'iva' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                ]">
                                    {{ r.type.toUpperCase() }}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-mono text-text-heading">{{ r.retention_number }}</td>
                            <td class="px-6 py-4 font-mono">
                                Factura #{{ (r.transaction?.control_number || r.transaction_id || '').split('-')[0] }}
                            </td>
                            <td class="px-6 py-4">
                                <div>
                                    <p class="font-bold text-text-heading">{{ r.transaction?.client?.name || 'Cliente sin nombre' }}</p>
                                    <p class="text-xs text-text-secondary font-mono">{{ r.transaction?.client?.identity_document || '' }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-4 font-bold text-right">{{ r.percentage }}%</td>
                            <td class="px-6 py-4 text-right font-bold text-text-heading font-mono">${{ Number(r.amount_retained).toFixed(2) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSupabaseClient, definePageMeta } from '#imports'
import { useOrganization } from '~/composables/useOrganization'
import * as XLSX from 'xlsx'

definePageMeta({
    layout: 'authenticated',
    middleware: 'admin-auth'
})

const client = useSupabaseClient()
const { organization } = useOrganization()

const currDate = new Date()
const filterMonth = ref(`${currDate.getFullYear()}-${String(currDate.getMonth() + 1).padStart(2, '0')}`)
const filterType = ref('all')

const loading = ref(false)
const retentions = ref<any[]>([])

// Computeds para KPIs
const filteredRetentions = computed(() => {
    if (filterType.value === 'all') return retentions.value
    return retentions.value.filter(r => r.type === filterType.value)
})

const totalIva = computed(() => {
    return retentions.value.filter(r => r.type === 'iva').reduce((acc, r) => acc + Number(r.amount_retained || 0), 0)
})

const totalIslr = computed(() => {
    return retentions.value.filter(r => r.type === 'islr').reduce((acc, r) => acc + Number(r.amount_retained || 0), 0)
})

const totalAcumulado = computed(() => totalIva.value + totalIslr.value)

const fetchRetentions = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const [year, month] = filterMonth.value.split('-')
        const startDate = `${year}-${month}-01T00:00:00.000Z`
        let nextMonth = parseInt(month) + 1
        let nextYear = parseInt(year)
        if (nextMonth > 12) {
            nextMonth = 1
            nextYear++
        }
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000Z`

        const { data, error } = await client
            .from('fiscal_retentions')
            .select(`
                *,
                transaction:transactions (
                    id, control_number, created_at,
                    client:clients(name, identity_document)
                )
            `)
            .eq('organization_id', organization.value.id)
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .order('created_at', { ascending: false })

        if (error) throw error
        retentions.value = data || []
    } catch (e: any) {
        console.error('Error fetching retentions:', e)
    } finally {
        loading.value = false
    }
}

watch([filterMonth, () => organization.value?.id], () => {
    fetchRetentions()
})

onMounted(() => {
    fetchRetentions()
})

const exportExcel = () => {
    if (filteredRetentions.value.length === 0) return

    const worksheetData = filteredRetentions.value.map((r, index) => {
        return {
            "Item": index + 1,
            "Fecha Registro": new Date(r.created_at).toLocaleDateString('es-VE'),
            "Cliente / Razón Social": r.transaction?.client?.name || 'S/N',
            "RIF": r.transaction?.client?.identity_document || 'V000000000',
            "Factura Asoc.": r.transaction?.control_number || r.transaction?.id.split('-')[0] || '',
            "Tipo Retención": r.type.toUpperCase(),
            "Número Comprobante": r.retention_number,
            "Porcentaje (%)": r.percentage,
            "Monto Retenido ($)": Number(r.amount_retained)
        }
    })

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const wscols = [
        { wch: 8 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, 
        { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 18 }
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Retenciones_${filterMonth.value}`)

    XLSX.writeFile(workbook, `Relacion_Retenciones_Softtuuls_${filterMonth.value}.xlsx`)
}
</script>
