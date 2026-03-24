export interface Organization {
    id: string
    name: string
    logo_url?: string
    subscription_status?: 'active' | 'inactive' | 'past_due' | 'trialing' | 'canceled'
    subscription_plan?: string
    trial_ends_at?: string
    current_period_end?: string
    stripe_customer_id?: string
    stripe_subscription_id?: string
    fiscal_doc?: string
    address?: string
    phone?: string
    receipt_footer?: string
    last_payment_failure?: string
    created_at: string
}

export interface Product {
    id: string
    organization_id: string
    name: string
    sku?: string
    price: number
    cost?: number // Added cost
    stock: number
    tax_condition?: 'exempt' | 'general' | 'reduced' // Nuevo IVA
    min_stock?: number // Umbral de alerta de stock bajo
    created_at: string
}

export interface Client {
    id: string
    organization_id: string
    name: string
    email?: string
    phone?: string
    identity_document?: string // Added Cédula/RIF
    is_special_taxpayer?: boolean // B2B: Retenciones 75%/100%
    created_at: string
}

export interface SaleItem {
    id: string
    transaction_id: string
    product_id: string
    product?: Product // joined
    quantity: number
    price_at_transaction: number
    tax_condition?: 'exempt' | 'general' | 'reduced'
    tax_rate?: number
    subtotal?: number // computed
    discount?: number // New: Item discount amount
}

export interface Sale {
    id: string
    organization_id: string
    client_id?: string
    client?: Client // joined
    type: 'sale'
    status: 'paid' | 'pending' | 'cancelled'
    payment_method: string
    payment_reference?: string
    amount: number
    date: string
    created_at?: string // Added
    client_name?: string // Added for UI helper
    currency?: 'USD' | 'VES'
    exchange_rate?: number
    subtotal?: number
    discount?: number // New: Global discount amount
    
    // Taxes (Venezuelan Schema)
    exempt_amount?: number
    tax_base?: number
    tax_general_amount?: number
    tax_reduced_amount?: number
    tax_igtf?: number

    items?: SaleItem[]
    payment_details?: {
        usd_amount?: number
        ves_amount?: number
        igtf_base?: number
        change?: number
    }
}

export interface Transaction {
    id: string
    organization_id: string
    client_id?: string
    client?: Client
    type: 'sale' | 'expense' | 'income' | 'adjustment'
    description: string
    amount: number
    currency: 'USD' | 'VES'
    exchange_rate: number
    payment_method: string
    payment_reference?: string
    date: string
    created_at: string
    status: string
    items?: any[]
    client_name?: string // Helper

    // Taxes
    exempt_amount?: number
    tax_base?: number
    tax_general_amount?: number
    tax_reduced_amount?: number
}


export interface CartItem {
    product: Product
    quantity: number
    discount: number
}

// Payload for creating a sale
export interface SalePayload {
    clientId?: string
    documentType: 'invoice' | 'delivery_note' // NEW
    status: 'paid' | 'pending'
    paymentMethod: string
    paymentReference?: string
    date: string
    currency: 'USD' | 'VES'
    exchangeRate: number
    subtotal: number
    taxIva: number
    taxIgtf: number
    discount: number
    isExempt: boolean
    
    // Taxes (Venezuelan Schema)
    exemptAmount?: number
    taxBase?: number
    taxGeneralAmount?: number
    taxReducedAmount?: number

    total: number
    paymentTermDays?: number | null // NEW
    paymentDetails: any // JSON structure varies
    rawItems: {
        productId: string
        quantity: number
        price: number
        discount: number
        taxCondition?: 'exempt' | 'general' | 'reduced'
        taxRate?: number
    }[]
    itemsSnapshot: {
        id: string
        name: string
        qty: number
        price: number
        discount: number
        taxCondition?: 'exempt' | 'general' | 'reduced'
        taxRate?: number
    }[]
    offline_flag?: boolean // Internal flag for offline sync
}
