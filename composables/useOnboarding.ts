import { driver } from 'driver.js'

export const useOnboarding = () => {

    const hasSeenTour = () => {
        if (process.server) return true
        return localStorage.getItem('has_seen_tour_v1') === 'true'
    }

    const markAsSeen = () => {
        if (process.client) {
            localStorage.setItem('has_seen_tour_v1', 'true')
        }
    }

    const startTour = () => {
        if (hasSeenTour()) return

        const driverObj = driver({
            showProgress: true,
            animate: true,
            doneBtnText: '¡Listo!',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            steps: [
                {
                    element: '#tour-welcome',
                    popover: {
                        title: '¡Bienvenido a SoftTuuls!',
                        description: 'Este es tu panel de control. Aquí verás el resumen de tus ventas y estadísticas. Pero primero, ¡empecemos a usarlo!',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-inventory-link',
                    popover: {
                        title: 'Paso 1: Inventario',
                        description: 'Haz clic aquí para ir al inventario y crear tu PRIMER PRODUCTO.',
                        side: 'right',
                        align: 'center'
                    }
                },
                // We can't easily guide them across pages with simple steps unless we handle routing in onNext.
                // For simplicity, we just point out where things are.
                {
                    element: '#tour-sales-link',
                    popover: {
                        title: 'Paso 2: Ventas',
                        description: 'Una vez tengas productos, ven aquí para registrar tu PRIMERA VENTA.',
                        side: 'right',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-settings-link',
                    popover: {
                        title: 'Configuración',
                        description: 'Personaliza tu negocio, impuestos y logo aquí.',
                        side: 'right',
                        align: 'center'
                    }
                }
            ],
            onDestroyStarted: () => {
                markAsSeen()
            }
        })

        driverObj.drive()
    }

    return {
        startTour,
        hasSeenTour
    }
}
