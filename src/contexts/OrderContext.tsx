import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { socketManager } from '@/lib/socket';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  name: string;
  brand?: string;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  cancelOrder: (id: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { items: cartItems, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders]);

  const placeOrder = async () => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour passer une commande',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Votre panier est vide',
        variant: 'destructive',
      });
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 15),
      items: cartItems,
      total: getTotalPrice(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id,
    };

    setOrders(prev => [...prev, newOrder]);
    setCurrentOrder(newOrder);
    clearCart();

    // Notify the server about the new order
    socketManager.emit('newOrder', newOrder);

    toast({
      title: 'Succès',
      description: 'Votre commande a été passée avec succès',
    });

    router.push(`/order-confirmation?orderId=${newOrder.id}`);
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const cancelOrder = (id: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, status: 'cancelled', updatedAt: new Date().toISOString() }
          : order
      )
    );

    toast({
      title: 'Succès',
      description: 'Votre commande a été annulée',
    });
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        placeOrder,
        getOrderById,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}