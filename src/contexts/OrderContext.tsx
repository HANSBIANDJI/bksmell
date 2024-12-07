import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserStore } from '@/stores/globalStore';
import { useToast } from '@/components/ui/use-toast';
import { socketManager } from '@/lib/socket';
import { useGlobalStore } from '@/stores/globalStore';

interface OrderItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  brand: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    zone: string;
  };
  deliveryFee: number;
  createdAt: string;
  shipping: {
    method: string;
    address: string;
    estimatedDelivery: string;
  };
}

interface OrderContextType {
  orders: Order[];
  createOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const setCurrentOrder = useUserStore(state => state.setCurrentOrder);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }

    const handleSocketConnection = () => {
      console.log('Socket connected');
      
      const newOrderCleanup = socketManager.on('newOrder', (order: Order) => {
        setOrders(prev => {
          const newOrders = [order, ...prev];
          localStorage.setItem('orders', JSON.stringify(newOrders));
          return newOrders;
        });

        toast({
          title: "Nouvelle commande",
          description: `Commande #${order.id} reçue`
        });
      });

      const statusUpdateCleanup = socketManager.on('orderStatusUpdated', ({ orderId, status }) => {
        setOrders(prev => {
          const newOrders = prev.map(order => 
            order.id === orderId ? { ...order, status } : order
          );
          localStorage.setItem('orders', JSON.stringify(newOrders));
          return newOrders;
        });
      });

      return () => {
        newOrderCleanup();
        statusUpdateCleanup();
      };
    };

    socketManager.connect();
    const cleanup = handleSocketConnection();

    return () => {
      cleanup();
      socketManager.disconnect();
    };
  }, [toast]);

  const createOrder = async (orderData: any): Promise<Order> => {
    try {
      const orderId = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Les items sont déjà dans le bon format, pas besoin de les enrichir
      const newOrder: Order = {
        ...orderData,
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        shipping: {
          method: orderData.deliveryType === 'rapid' ? 'Livraison rapide (24h)' : 'Livraison normale (48-72h)',
          address: `${orderData.shippingAddress.fullName}, ${orderData.shippingAddress.phone}, ${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.zone}`,
          estimatedDelivery: orderData.deliveryType === 'rapid' ? '24 heures' : '48-72 heures'
        }
      };

      // Mettre à jour le state local et le localStorage
      setOrders(prev => {
        const newOrders = [newOrder, ...prev];
        localStorage.setItem('orders', JSON.stringify(newOrders));
        return newOrders;
      });

      // Sauvegarder la commande courante
      setCurrentOrder(newOrder);

      // Émettre l'événement WebSocket
      try {
        await socketManager.emit('newOrder', newOrder);
      } catch (error) {
        console.error('Error emitting newOrder event:', error);
      }

      // Rediriger vers la page de confirmation avec l'état de la commande
      router.push('/order-confirmation', { 
        state: { order: newOrder },
        replace: true 
      });

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // Vérifier si la commande existe
      const orderExists = orders.some(order => order.id === orderId);
      if (!orderExists) {
        throw new Error('Commande non trouvée');
      }

      // Mettre à jour le state local
      setOrders(prev => {
        const newOrders = prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        );
        localStorage.setItem('orders', JSON.stringify(newOrders));
        return newOrders;
      });

      // Envoyer la mise à jour au serveur
      try {
        await socketManager.emit('updateOrderStatus', { orderId, status });
      } catch (socketError) {
        console.error('Erreur WebSocket lors de la mise à jour du statut:', socketError);
        // On ne relance pas l'erreur ici car la mise à jour locale a réussi
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      updateOrderStatus,
      getOrderById
    }}>
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