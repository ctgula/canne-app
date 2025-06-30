export type Order = {
  id: string;
  user_id?: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  is_delivery: boolean;
  delivery_notes?: string;
  payment_method: 'cash' | 'card' | 'other';
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  tier: string;
  weight: string;
  color_theme: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  tier: string;
  weight: string;
  color_theme: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
};
