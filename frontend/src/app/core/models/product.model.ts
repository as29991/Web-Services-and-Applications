export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category_id?: number;
  brand_id?: number;
  gender_id?: number;
  color_id?: number;
  size_id?: number;
  image_url?: string;
  is_active: boolean;
  category_name?: string;
  brand_name?: string;
  gender_name?: string;
  color_name?: string;
  size_name?: string;
  created_at: string;
  updated_at: string;
  current_quantity?: number; 
  

  has_discount?: boolean;
  discount_id?: number;
  discount_percentage?: number;
  discount_amount?: number;
  discounted_price?: number;
}

export interface ProductQuantity {
  product_id: number;
  name: string;
  initial_quantity: number;
  sold_quantity: number;
  current_quantity: number;
}

export interface ProductSearchParams {
  gender?: string;
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  price_min?: number;
  price_max?: number;
  availability?: 'in_stock' | 'out_of_stock';
  search?: string;
  page?: number;
  limit?: number;
}