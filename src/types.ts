export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  image: string;
  badge?: string;
  countSold?: string;
  description?: string;
  options?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  paymentMethod: 'bcel_one' | 'qr_pay' | 'cash_on_delivery';
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  slipUploaded: boolean;
  slipImage?: string;
  status: 'pending' | 'processing' | 'confirmed';
  freeGift?: string;
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
}
