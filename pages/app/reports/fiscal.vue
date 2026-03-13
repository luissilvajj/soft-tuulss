<template>
  <div class="max-w-6xl mx-auto py-8">
      <div class="mb-8 flex justify-between items-center">
          <div>
              <h1 class="text-3xl font-bold text-text-heading flex items-center gap-2">
                  <span class="bg-primary-100 text-primary-700 p-2 rounded-lg"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></span>
                  Módulo de Auditoría Fiscal
              </h1>
              <p class="text-text-secondary mt-2">Visor exclusivo de Reportes Z (Cierre Diario) para inspección tributaria (SENIAT).</p>
          </div>
          <div class="flex items-center gap-2">
			<UiDatePicker
                v-model:start="dateStore.startDate"
                v-model:end="dateStore.endDate"
            />
            <BaseButton variant="secondary" @click="fetchZReports" :loading="loading" class="h-10">
                <svg class="w-4 h-4" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </BaseButton>
          </div>
      </div>

       <!-- Data List -->
        <div class="bg-surface-ground rounded-xl border border-surface-border shadow-sm overflow-hidden">
             
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr class="bg-surface-section text-text-secondary border-b border-surface-border uppercase tracking-wider text-xs">
                            <th class="px-6 py-4 font-bold border-r border-surface-border/50">Nº Z</th>
                            <th class="px-6 py-4 font-bold border-r border-surface-border/50">Fecha de Cierre</th>
                            <th class="px-6 py-4 font-bold text-right">Ventas Totales</th>
                            <th class="px-6 py-4 font-bold text-right">Monto Exento</th>
                            <th class="px-6 py-4 font-bold text-right">Base Gral (16%)</th>
                            <th class="px-6 py-4 font-bold text-right text-primary-600">IVA Gral</th>
                            <th class="px-6 py-4 font-bold text-right">Base Red (8%)</th>
                            <th class="px-6 py-4 font-bold text-right text-primary-600">IVA Reducido</th>
                            <th class="px-6 py-4 font-bold text-right bg-surface-subtle">IGTF (3%)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-border">
                         <tr v-if="loading && zReports.length === 0" class="text-center">
                            <td colspan="9" class="px-6 py-12 text-text-secondary">Cargando libros...</td>
                        </tr>
                         <tr v-if="!loading && zReports.length === 0" class="text-center">
                            <td colspan="9" class="px-6 py-12 text-text-secondary">No hay Reportes Z emitidos en este rango de fechas.</td>
                        </tr>
                        <tr v-for="report in zReports" :key="report.id" class="hover:bg-surface-subtle transition-colors">
                            <td class="px-6 py-3 font-bold text-text-heading border-r border-surface-border/50">
                                #{{ String(report.z_correlative_number).padStart(5, '0') }}
                            </td>
                            <td class="px-6 py-3 text-text-body font-mono border-r border-surface-border/50">
                                {{ formatDateDetailed(report.created_at) }}
                            </td>
                            <td class="px-6 py-3 font-medium text-text-heading text-right">{{ formatPrice(report.total_sales) }}</td>
                            <td class="px-6 py-3 text-text-secondary text-right">{{ formatPrice(report.total_exempt) }}</td>
                            <td class="px-6 py-3 text-text-body text-right">{{ formatPrice(report.total_base_general) }}</td>
                            <td class="px-6 py-3 font-bold text-primary-600 text-right">{{ formatPrice(report.total_tax_general) }}</td>
                            <td class="px-6 py-3 text-text-body text-right">{{ formatPrice(report.total_base_reduced) }}</td>
                            <td class="px-6 py-3 font-bold text-primary-600 text-right">{{ formatPrice(report.total_tax_reduced) }}</td>
                            <td class="px-6 py-3 font-bold text-text-heading text-right bg-surface-subtle/50">{{ formatPrice(report.total_igtf) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganization } from '~/composables/useOrganization'
import { usePermissions } from '~/composables/usePermissions'
import { useFormat } from '~/composables/useFormat'
import { useToast } from "vue-toastification"

definePageMeta({
    layout: 'authenticated',
    middleware: 'admin-auth' // In real life, seniat_auth or combine
})

const { organization } = useOrganization()
const { isSeniatAuditor, isAdmin } = usePermissions() // Usually Admins can also see this to export it
const { formatPrice, formatDate } = useFormat()
const client = useSupabaseClient()
const toast = useToast()

const zReports = ref<any[]>([])
const loading = ref(false)

// Simple local state for date filters (defaults to current month)
const today = new Date()
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const dateStore = reactive({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
})

const fetchZReports = async () => {
    if (!organization.value?.id) return
    loading.value = true
    try {
        const { data, error } = await client
            .from('fiscal_z_reports')
            .select('id, organization_id, closing_date, z_correlative_number, total_sales, total_exempt, total_base_general, total_tax_general, total_base_reduced, total_tax_reduced, total_igtf, created_at')
            .eq('organization_id', organization.value.id)
            .gte('closing_date', dateStore.startDate)
            .lte('closing_date', dateStore.endDate)
            .order('z_correlative_number', { ascending: false })

        if (error) throw error
        zReports.value = data || []
    } catch (e: any) {
         toast.error(e.message || 'Error al obtener Libros Fiscales')
    } finally {
        loading.value = false
    }
}

const formatDateDetailed = (iso: string) => {
    return new Date(iso).toLocaleString('es-VE', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

onMounted(() => {
    fetchZReports()
})

watch(() => organization.value?.id, () => {
    fetchZReports()
})
</script>
