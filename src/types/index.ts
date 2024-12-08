export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string; // For video preview
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
}

export interface HeroSettings {
  slides: HeroSlide[];
  autoplay: boolean;
  interval: number;
}

export interface MediaUploadResponse {
  url: string;
  thumbnailUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'CLIENT';
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  shipping: ShippingInfo;
  shippingAddress: Address;
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order: Order;
  perfumeId: string;
  perfume: Perfume;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  categoryId?: string;
  category?: Category;
  isNew: boolean;
  isOnSale: boolean;
  orderItems?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  perfumes: Perfume[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  order: Order;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  orderId: string;
  order: Order;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingInfo {
  id: string;
  orderId: string;
  order: Order;
  method: 'STANDARD' | 'EXPRESS';
  trackingNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderContextType {
  orders: Order[];
  createOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED') => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  loading: boolean;
  error: string | null;
}

export interface AdminContextType {
  products: Perfume[];
  perfumes: Perfume[];
  addProduct: (product: Partial<Perfume>) => Promise<Perfume>;
  addPerfume: (perfume: Partial<Perfume>) => Promise<Perfume>;
  updateProduct: (id: string, product: Partial<Perfume>) => Promise<Perfume>;
  updatePerfume: (id: string, perfume: Partial<Perfume>) => Promise<Perfume>;
  deleteProduct: (id: string) => Promise<void>;
  deletePerfume: (id: string) => Promise<void>;
  updateHeroSlides: (slides: HeroSlide[] | (() => HeroSlide[])) => Promise<void>;
  loginAdmin: (credentials: { email: string; password: string }) => Promise<void>;
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
}