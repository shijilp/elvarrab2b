
export type StoreSettings = {
  currency_code: string;
  shipping_enabled: boolean;
  shipping_flat: number;
  free_shipping_min: number;
  commission_limit_pct: number;
  min_order_value: number;
  cod_enabled: boolean;
  deals_enabled: boolean;
  premium_enabled: boolean;
  special_enabled:boolean;
  offer_banner_enabled:boolean;
  offer_banner_title:string;
  cod_fee: number;
  max_cod_amount: number;
  delivery_days_min: number;
  delivery_days_max: number;
  shipping_note?: string;
  deals_banner_title?: string;
  premium_style?: string;
  updated_at?: string;
  maintenance:boolean | false;
  deals_weekend?:boolean;
  deals_combo?:boolean;
  version_key?:string;
  version_value?:string;
  b2bmaint?:boolean;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  currency_code: "INR",
  shipping_enabled: true,
  shipping_flat: 30,
  free_shipping_min: 500,
  commission_limit_pct: 0.5,
  min_order_value: 0,
  cod_enabled: false,
  deals_enabled: false,
  premium_enabled: false,
  special_enabled:false,
  cod_fee: 0,
  max_cod_amount: 0,
  delivery_days_min: 2,
  delivery_days_max: 7,
  shipping_note: "",
  deals_banner_title: "",
  premium_style: "style1",
  offer_banner_enabled:false,
  offer_banner_title:"Test",
  maintenance:false,
  deals_weekend:false,
  deals_combo:false,
  version_key:"",
  version_value:"",
  b2bmaint:false,

};
