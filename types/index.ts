export interface Product {
  id: number
  name: string
  slug: string
  description: string
  category:   Category | null
  price: number
  compare_at_price:number
  image: string
  images?: { id: number; image: string }[]
  in_stock: boolean
  tag?: 'new' | 'bestseller' | 'deal' | 'premiume'|null
  rating?: number
  sku?: string
  brand?: string
  inventory: number
  low_stock_threshold: number
  backorder_allowed: boolean
  is_active: boolean
}

export interface CartItem   {
  quantity: number
  id: number
  name: string
  slug: string
  description: string
  category:   Category | null
  price: number
  image: string
  images?: { id: number; image: string }[]
    in_stock: boolean
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
}


export interface ProductTiny {
  name: string
  slug: string
  description: string
  category:   Category | null
  price: number
  in_stock: boolean
  image: string

}

export interface Order {
  id: number
  full_name: string
  email: string
  line1: string
  line2:   string
  city: string
  state: boolean
  image: string
  phone: string
  pincode : string
    country : string
    created_at : string
    applied_coupon_code : string
    discount_amount : string
    subtotal_amount : string
    total_amount : string
 
    status : string
    is_paid : string
    razorpay_payment_id : string
}

export type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  // optional fields Razorpay may send
  razorpay_subscription_id?: string;
  razorpay_payment_link_id?: string;
  razorpay_payment_link_reference_id?: string;
  razorpay_payment_link_status?: string;
};
type VerifyPayload = {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};