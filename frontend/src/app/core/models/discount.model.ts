export interface Discount {
  id: number;
  product_id: number;
  discount_percentage?: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  product_name?: string;
  product_price?: number;
  created_by?: number;
  created_by_username?: string;
}
