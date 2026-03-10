export const useFormat = () => {

    const formatMoney = (amount: number | string, currency: 'USD' | 'VES' = 'USD', locale = 'es-VE') => {
        const val = Number(amount)
        if (isNaN(val)) return '0.00'

        if (currency === 'VES') {
            return `Bs. ${val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        } else {
            // Default to US format for USD
            return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
    }

    const formatDate = (date: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) => {
        if (!date) return ''
        return new Date(date).toLocaleString('es-VE', options)
    }

    const formatNumber = (num: number, decimals = 0) => {
        return Number(num).toLocaleString('es-VE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    }

    return {
        formatMoney,
        formatDate,
        formatNumber,
        // Legacy Aliases
        formatPrice: formatMoney,
        formatDisplayPrice: formatMoney,
        formatPriceInBs: (amount: number | string) => formatMoney(amount, 'VES')
    }
}
