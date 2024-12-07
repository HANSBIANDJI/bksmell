import { useOrder } from '@/contexts/OrderContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Package, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Commandes() {
  const { orders } = useOrder();

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Aucune commande</h2>
          <p className="text-gray-600 mb-8">Vous n'avez pas encore passé de commande</p>
          <Button onClick={() => window.location.href = '/'}>
            Découvrir nos produits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
            <Package className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Mes Commandes</h1>
          <p className="text-lg text-muted-foreground">
            Suivez l'état de vos commandes
          </p>
        </div>

        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Commande #{order.id}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(order.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {order.status === 'PENDING' && 'En attente'}
                      {order.status === 'CONFIRMED' && 'Confirmée'}
                      {order.status === 'DELIVERED' && 'Livrée'}
                      {order.status === 'CANCELLED' && 'Annulée'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.brand} • Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{(order.total - order.deliveryFee).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{order.deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{order.total.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informations de livraison</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.shipping.address}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Méthode: {order.shipping.method}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Délai estimé: {order.shipping.estimatedDelivery}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
