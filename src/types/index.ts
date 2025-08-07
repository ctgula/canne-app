export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  artworkUrl: string;
  giftSize: string; // e.g., "3.5g", "7g", etc.
  hasDelivery: boolean; // whether this price tier includes free delivery
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  hasDelivery: boolean;
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  // Flexible to support granular slots like "9:00–10:00 AM", "ASAP", etc.
  timePreference: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  deliveryDetails: DeliveryDetails;
  total: number;
  hasDelivery: boolean;
  status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
} 