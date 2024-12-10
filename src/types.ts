export interface Perfume {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  isOnSale?: boolean;
  discount?: number;
  brand?: string;
  category?: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  active: boolean;
  order: number;
  buttonText?: string;
  buttonLink?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  perfumeId: string;
  perfume: Perfume;
  quantity: number;
  price: number;
  orderId: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  orders?: Order[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'admin';
