export interface EarningsReport {
  date?: string;
  month?: number;
  year?: number;
  total_orders: number;
  total_earnings: number;
}

export interface TopSellingProduct {
  product_id: number;
  product_name: string;
  price: number;
  category: string;
  brand: string;
  image_url?: string;
  total_sold: number;
  total_revenue: number;
}

export interface SalesByCategory {
  category_id: number;
  category_name: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
}

export interface LowStockProduct {
  product_id: number;
  product_name: string;
  price: number;
  category: string;
  brand: string;
  initial_quantity: number;
  sold_quantity: number;
  current_quantity: number;
}

export interface RevenueSummary {
  today: { orders: number; revenue: number };
  this_month: { orders: number; revenue: number };
  this_year: { orders: number; revenue: number };
  all_time: { orders: number; revenue: number };
  order_status_breakdown: { status: string; count: number }[];
}
