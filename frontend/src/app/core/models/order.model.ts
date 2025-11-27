export interface Order {
  id: number;
  client_id: number;
  order_number: string;
  order_date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  notes?: string;
  first_name?: string;
  last_name?: string;
  client_email?: string;
  created_by_username?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_applied: number;
  subtotal: number;
  product_name?: string;
  product_image?: string;
}

export interface CreateOrderRequest {
  client_id: number;
  items: {
    product_id: number;
    quantity: number;
  }[];
  shipping_address: string;
  notes?: string;
}
