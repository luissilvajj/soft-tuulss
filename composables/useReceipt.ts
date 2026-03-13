import html2canvas from 'html2canvas'
import { useToast } from "vue-toastification"
import { ref } from 'vue'

export const useReceipt = () => {
    const toast = useToast()
    const generating = ref(false)

    const generateReceiptImage = async (elementId: string): Promise<string | null> => {
        const el = document.getElementById(elementId)
        if (!el) return null

        generating.value = true
        try {
            // Need to temporarily unhide or clone logic if hidden. 
            // In Vue we might render it off-screen but visible to DOM.
            // Assuming the component puts it in a visible absolute container or we clone it.
            // For this snippet, we assume the user temporarily Shows the modal or element.
            // Or we clone the hidden element to body, render, remove.

            // Clone approach for hidden elements
            const clone = el.cloneNode(true) as HTMLElement
            clone.style.position = 'absolute'
            clone.style.top = '-9999px'
            clone.style.display = 'block' // make visible offscreen
            document.body.appendChild(clone)

            const canvas = await html2canvas(clone, {
                scale: 2, // better quality
                logging: false,
                backgroundColor: '#ffffff'
            })

            document.body.removeChild(clone)
            return canvas.toDataURL('image/jpeg', 0.8)

        } catch (e) {
            console.error('Receipt gen error', e)
            toast.error('Error generando recibo')
            return null
        } finally {
            generating.value = false
        }
    }

    const generateReceiptPDF = async (elementId: string, filename: string = 'Factura_Fiscal.pdf'): Promise<boolean> => {
        const el = document.getElementById(elementId)
        if (!el) return false

        generating.value = true
        try {
            const clone = el.cloneNode(true) as HTMLElement
            clone.style.position = 'absolute'
            clone.style.top = '-9999px'
            clone.style.display = 'block'
            document.body.appendChild(clone)

            const canvas = await html2canvas(clone, {
                scale: 2,
                logging: false,
                backgroundColor: '#ffffff'
            })
            document.body.removeChild(clone)

            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            
            // Importación dinámica de jsPDF para Evitar Errores SSR "window is not defined"
            const { jsPDF } = await import('jspdf')
            
            // A4: 210 x 297 mm
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            // Ajustamos la altura de acuerdo al ratio del canvas para no deformar
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(filename)
            
            toast.success('PDF Generalizado correctamente')
            return true

        } catch (e) {
            console.error('PDF gen error', e)
            toast.error('Error generando PDF')
            return false
        } finally {
            generating.value = false
        }
    }

    const shareViaWhatsapp = async (phone: string, saleId: string, imageUrl?: string) => {
        // WhatsApp API doesn't allow direct image file upload via URL scheme easily without external hosting or Business API.
        // Standard "Click to Chat" allows text.
        // Strategy: Send text + "The image was generated". User can manually paste if on mobile clipboard (not possible automatically).
        // REALITY CHECK Latam: 
        // 1. Desktop: Download Image -> Web.Whatsapp -> Drag & Drop.
        // 2. Mobile: Share API (navigator.share) with File.

        let text = `Hola! Aquí tienes tu recibo de compra. Ref: ${saleId}`

        // If we have an image DataURL, checking if we can use Navigator Share Level 2
        if (imageUrl && navigator.canShare) {
            try {
                const blob = await (await fetch(imageUrl)).blob()
                const file = new File([blob], `recibo-${saleId}.jpg`, { type: 'image/jpeg' })
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Recibo de Compra',
                        text: text
                    })
                    return // Native share success
                }
            } catch (e) {
                console.warn('Share API failed', e)
            }
        }

        // Fallback: Open WhatsApp with text (Image must be sent manually)
        const link = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        window.open(link, '_blank')
    }

    const downloadReceipt = (dataUrl: string, filename: string) => {
        const link = document.createElement('a')
        link.download = filename
        link.href = dataUrl
        link.click()
    }

    // ── Fiscal Agent Integration (Hardware Printer) ─────────
    const FISCAL_AGENT_URL = 'http://localhost:4040'
    const fiscalAgentOnline = ref(false)
    const printingFiscal = ref(false)

    const checkFiscalAgent = async () => {
        // Prevent Mixed Content errors if on HTTPS and agent is on HTTP
        if (process.client && window.location.protocol === 'https:' && FISCAL_AGENT_URL.startsWith('http:')) {
            console.warn('Fiscal Agent check skipped: Mixed Content (HTTPS -> HTTP local) usually blocked by browsers.')
            fiscalAgentOnline.value = false
            return
        }

        try {
            const res = await fetch(`${FISCAL_AGENT_URL}/status`, { 
                mode: 'no-cors', // Try to avoid some CORS/Mixed Content preflights if just checking existence
                signal: AbortSignal.timeout(2000) 
            })
            // console.log('Fiscal Agent check res:', res.type)
            // Note: with no-cors, we can't read the body, but we know it reached something
            fiscalAgentOnline.value = true 
        } catch (e) {
            // console.warn('Fiscal Agent offline:', e)
            fiscalAgentOnline.value = false
        }
    }

    const printToFiscalPrinter = async (sale: any): Promise<boolean> => {
        printingFiscal.value = true
        try {
            const res = await fetch(`${FISCAL_AGENT_URL}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale),
                signal: AbortSignal.timeout(10000)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || err.error || 'Print failed')
            }

            toast.success('Impresión fiscal enviada correctamente')
            return true
        } catch (e: any) {
            console.error('Fiscal print error:', e)
            if (e.name === 'TimeoutError' || e.message?.includes('fetch')) {
                toast.error('No se pudo conectar con el Agente Fiscal. ¿Está ejecutándose en esta PC?')
            } else {
                toast.error(`Error de impresión: ${e.message}`)
            }
            return false
        } finally {
            printingFiscal.value = false
        }
    }

    return {
        generateReceiptImage,
        generateReceiptPDF,
        shareViaWhatsapp,
        downloadReceipt,
        generating,
        // Fiscal Agent
        checkFiscalAgent,
        printToFiscalPrinter,
        fiscalAgentOnline,
        printingFiscal
    }
}
