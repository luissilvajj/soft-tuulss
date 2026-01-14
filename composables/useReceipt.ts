import html2canvas from 'html2canvas'
import { useToast } from "vue-toastification"

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

    return {
        generateReceiptImage,
        shareViaWhatsapp,
        downloadReceipt,
        generating
    }
}
