declare module 'midtrans-client' {
  export interface MidtransConfig {
    isProduction?: boolean
    serverKey?: string
    clientKey?: string
  }

  export interface TransactionDetails {
    order_id: string
    gross_amount: number
  }

  export interface CustomerDetails {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  }

  export interface ItemDetails {
    id: string
    price: number
    quantity: number
    name: string
    category?: string
  }

  export interface ChargeParameter {
    payment_type: string
    transaction_details: TransactionDetails
    customer_details?: CustomerDetails
    item_details?: ItemDetails[]
    custom_field1?: string
    custom_expiry?: {
      expiry_duration: number
      unit: string
    }
  }

  export interface MidtransResponse {
    qr_string?: string
    acquirer?: string
    merchant_id?: string
    order_id?: string
    gross_amount?: string
    currency?: string
    payment_type?: string
    transaction_time?: string
    transaction_status?: string
    transaction_id?: string
    status_code?: string
    status_message?: string
    actions?: Array<{
      name: string
      method: string
      url: string
    }>
  }

  export class Snap {
    constructor(config: MidtransConfig)
    createTransaction(parameter: any): Promise<any>
  }

  export class CoreApi {
    constructor(config: MidtransConfig)
    charge(parameter: ChargeParameter): Promise<MidtransResponse>
    transaction: {
      status(orderId: string): Promise<MidtransResponse>
    }
  }

  const midtransClient: {
    Snap: typeof Snap
    CoreApi: typeof CoreApi
  }

  export default midtransClient
}