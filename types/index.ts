export interface ProductLite {
  id: number
  name: string
  slug: string
  description: string
  category:   Category | null
  price: number
  image: string
  images?: Array<ProductImage | string>
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

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  category:   Category | null
  price: number
  compare_at_price:number
  image: string
  images: Array<ProductImage | string>
  in_stock: boolean
  tag?: 'new' | 'bestseller' | 'deal' | 'premiume'|null
  rating?: number
  sku?: string
  brand?: string
  inventory: number
  gtin:string
  mpn:string
  low_stock_threshold: number
  backorder_allowed: boolean
  is_active: boolean
  spec?: ProductSpec | null;
  stones?: Stone[] | null;
  variants?: Variant[]; 
  meta_description?: string;
  currency?: string;
  weight_kg:string;
  length_cm:string;
  width_cm:string;
  height_cm:string;
}
export type ProductImage = {
  id?: number;
  image: string; // url
  alt?: string | null;
};

export interface CartProduct   {
  id: number
  name: string
  slug: string
  price: number
  in_stock: boolean
    description: string
      image: string
  category:   Category | null


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
 export interface AssignedUser {
  email: string;
  first_name: string;
  phone: string;
  id: number ;
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
  currency:string;
  coupon_code : string
  discount : number
  shipping:number
  subtotal : number
  total_amount : number
  status : OrderStatus
  is_paid : string
  razorpay_payment_id : string
  items:OrderItems[]
  notes:any
  assigned_to:AssignedUser
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

export type OrderStatus =
  | "new"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

  
export type ProductSpec = {
  id: number;
  base_material: "316L_STEEL" | string;
  silver_fineness: number | null;   // 316 for steel in your sample
  gold_karat: number | null;        // 18 in your sample
  plating_type: string | null;      // "GOLD_18K" etc.
  plating_thickness_microns?: number | null;
  coating?: string | null;
  hypoallergenic?: boolean | null;
  water_resistant?: boolean | null;
  nickel_free?: boolean | null;
  lead_free?: boolean | null;
  cadmium_free?: boolean | null;
};

export type Stone = {
  id?: number;
  type?: string | null;
  name?: string | null;
  color?: string | null;
  shape?: string | null;
  size_mm?: number | string | null;
  count?: number | null;
  treatment?: string | null;
  grade?: string | null;
};

export type Variant = {
  id: number;
  sku: string;
  barcode?: string | null;
  price:string;
  price_delta: string;               // keep as string because API returns "200.00"
  compare_at_price?: string | null;
  currency: string;            // "INR"
  inventory: number;
  in_stock: boolean;
  backorder_allowed: boolean;
  image?: string | null;
  option_values?: Array<{ name: string; value: string }>;
};

export type OrderItems={
  id:number;
  product:Product;
  quantity:number;
  price:number

}


// backorder 
 interface Customer {
  email: string;
  full_name: string;
  phone: string;
  user_id: number | null;
}


 interface Item {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  product:Product
  // add more fields if your API includes them (image, sku, etc.)
}

 interface Meta {
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  notes: string | null;
}

 interface Shipping {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface BackOrder {
  id: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  customer: Customer;
  currency?: string;
  subtotal : number
  discount : number
  items: Item[];
  meta: Meta;
  shipping:number;
  payment_status: "Pending" | "Paid" | "Failed"; // adjust based on your statuses
  shipping_ad: Shipping;
  status: "processing" | "shipped" | "delivered" | "cancelled"; // extend as needed
  total_amount: number; // could also be number if you parse it
  notes:any;
  assigned_to:AssignedUser;

}