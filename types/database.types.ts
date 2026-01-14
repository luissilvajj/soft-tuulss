export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            items: {
                Row: {
                    created_at: string
                    id: string
                    name: string
                    price: number
                    qty: number
                    sku: string | null
                    transaction_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name: string
                    price: number
                    qty: number
                    sku?: string | null
                    transaction_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                    price?: number
                    qty?: number
                    sku?: string | null
                    transaction_id?: string
                }
            }
            organizations: {
                Row: {
                    created_at: string
                    id: string
                    logo_url: string | null
                    name: string
                    subscription_plan: string | null
                    subscription_status: string | null
                    fiscal_doc: string | null
                    address: string | null
                    phone: string | null
                    receipt_footer: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    logo_url?: string | null
                    name: string
                    subscription_plan?: string | null
                    subscription_status?: string | null
                    fiscal_doc?: string | null
                    address?: string | null
                    phone?: string | null
                    receipt_footer?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    logo_url?: string | null
                    name?: string
                    subscription_plan?: string | null
                    subscription_status?: string | null
                    fiscal_doc?: string | null
                    address?: string | null
                    phone?: string | null
                    receipt_footer?: string | null
                }
            }
            organization_members: {
                Row: {
                    id: string
                    organization_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'member' | 'cashier'
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    user_id: string
                    role?: 'owner' | 'admin' | 'member' | 'cashier'
                    created_at?: string
                }
                Update: {
                    role?: 'owner' | 'admin' | 'member' | 'cashier'
                }
            }
            products: {
                Row: {
                    created_at: string
                    id: string
                    name: string
                    organization_id: string
                    price: number
                    sku: string | null
                    stock: number
                    cost: number
                    deleted_at: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name: string
                    organization_id: string
                    price?: number
                    sku?: string | null
                    stock?: number
                    cost?: number
                    deleted_at?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                    organization_id?: string
                    price?: number
                    sku?: string | null
                    stock?: number
                    cost?: number
                    deleted_at?: string | null
                }
            }
            transactions: {
                Row: {
                    amount: number
                    client_id: string | null
                    created_at: string
                    date: string
                    id: string
                    organization_id: string
                    payment_method: string | null
                    payment_reference: string | null
                    status: string | null
                    type: string
                    currency: string
                    exchange_rate: number
                    items_snapshot: Json
                    created_by: string
                }
                Insert: {
                    amount?: number
                    client_id?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    organization_id: string
                    payment_method?: string | null
                    payment_reference?: string | null
                    status?: string | null
                    type: string
                    currency?: string
                    exchange_rate?: number
                    items_snapshot?: Json
                    created_by?: string
                }
                Update: {
                    amount?: number
                    client_id?: string | null
                    created_at?: string
                    date?: string
                    id?: string
                    organization_id?: string
                    payment_method?: string | null
                    payment_reference?: string | null
                    status?: string | null
                    type?: string
                    currency?: string
                    exchange_rate?: number
                    items_snapshot?: Json
                    created_by?: string
                }
            }
            transaction_items: {
                Row: {
                    id: string
                    transaction_id: string
                    product_id: string | null
                    quantity: number
                    price_at_transaction: number
                    organization_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    product_id?: string | null
                    quantity: number
                    price_at_transaction: number
                    organization_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    product_id?: string | null
                    quantity?: number
                    price_at_transaction?: number
                    organization_id?: string
                    created_at?: string
                }
            },
            clients: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    email: string | null
                    phone: string | null
                    identity_document: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    identity_document?: string | null
                    created_at?: string
                }
                Update: {
                    name?: string
                    email?: string | null
                    phone?: string | null
                    identity_document?: string | null
                }
            }
        }
        Views: {
            view_sales_normalized: {
                Row: {
                    id: string
                    date: string
                    original_amount: number
                    currency: string
                    exchange_rate: number
                    amount_usd: number
                    status: string
                    organization_id: string
                }
            }
            mv_daily_sales_stats: {
                Row: {
                    day: string
                    total_count: number
                    total_usd: number
                    organization_id: string
                }
            }
        }
        Functions: {
            decrement_stock: {
                Args: { p_id: string; q: number }
                Returns: boolean
            }
            restock_product_weighted: {
                Args: { p_id: string; qty_added: number; new_cost: number }
                Returns: void
            }
            refresh_dashboard_stats: {
                Args: Record<PropertyKey, never>
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
