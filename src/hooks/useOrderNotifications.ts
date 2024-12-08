import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket';
import { useToast } from '@/components/ui/use-toast';

export function useOrderNotifications() {
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();
  const { socket, on, off } = useSocket();
  const notificationSound = new Audio('/notification.mp3');

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order: any) => {
      setOrders(prev => [order, ...prev]);
      notificationSound.play();
      toast({
        title: "Nouvelle commande !",
        description: `Commande #${order.id} reçue`,
      });
    };

    const handleOrderUpdate = (updatedOrder: any) => {
      setOrders(prev =>
        prev.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      toast({
        title: "Commande mise à jour",
        description: `Commande #${updatedOrder.id} a été mise à jour`,
      });
    };

    on('newOrder', handleNewOrder);
    on('orderUpdate', handleOrderUpdate);

    return () => {
      off('newOrder', handleNewOrder);
      off('orderUpdate', handleOrderUpdate);
    };
  }, [socket, toast, on, off]);

  const updateOrderStatus = (orderId: string, status: string) => {
    socket.emit('updateOrderStatus', { orderId, status });
  };

  return {
    orders,
    updateOrderStatus
  };
}