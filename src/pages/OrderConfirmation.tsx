import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useParams } from 'react-router-dom';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useUserStore } from '@/stores/globalStore';

interface OrderConfirmationProps {
  orderId?: string;
}

export default function OrderConfirmation({ orderId: propOrderId }: OrderConfirmationProps) {
  const router = useRouter();
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const currentOrder = useUserStore((state) => state.currentOrder);
  const setCurrentOrder = useUserStore((state) => state.setCurrentOrder);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const finalOrderId = propOrderId || paramOrderId;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!finalOrderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${finalOrderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError('Error fetching order details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [finalOrderId]);

  useEffect(() => {
    if (!currentOrder) {
      router.push('/');
      return;
    }
    clearCart();

    return () => {
      // Nettoyage lors du démontage du composant
      setCurrentOrder(null);
    };
  }, [currentOrder, router, clearCart, setCurrentOrder]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold text-red-600">Error</h1>
            <p className="text-gray-600">{error || 'Order not found'}</p>
            <Button
              className="mt-4"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const orderNumber = String(order.id).padStart(4, '0');

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderNumber);
    toast({
      title: "Copié !",
      description: "Le numéro de commande a été copié dans le presse-papier"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
        return 'text-purple-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En cours';
      case 'shipped':
        return 'Expédié';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Order ID:</span> {order.id}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className="capitalize">{order.status.toLowerCase()}</span>
            </p>
            <p>
              <span className="font-medium">Date:</span>{' '}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
          <div className="space-y-1">
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">{item.perfume.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total + order.deliveryFee)}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            className="min-w-[200px]"
            onClick={() => window.location.href = '/'}
          >
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
}