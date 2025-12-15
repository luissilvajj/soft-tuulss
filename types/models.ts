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
    created_at: string
}

export interface Client {
    id: string
    organization_id: string
    name: string
    email?: string
    phone?: string
    identity_document?: string // Added Cédula/RIF
    created_at: string
}

export interface SaleItem {
    id: string
    transaction_id: string
    product_id: string
    product?: Product // joined
    quantity: number
    price_at_transaction: number
    subtotal?: number // computed
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
    tax_iva?: number
    tax_igtf?: number
    is_exempt?: boolean
    items?: SaleItem[]
    payment_details?: {
        usd_amount?: number
        ves_amount?: number
        igtf_base?: number
        change?: number
    }
}
