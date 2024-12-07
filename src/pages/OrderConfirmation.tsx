import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, MapPin, Clock, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useUserStore } from '@/stores/globalStore';

export default function OrderConfirmation() {
  const router = useRouter();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const currentOrder = useUserStore((state) => state.currentOrder);
  const setCurrentOrder = useUserStore((state) => state.setCurrentOrder);

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

  // Si pas de commande, ne rien afficher pendant la redirection
  if (!currentOrder) {
    return null;
  }

  const orderNumber = String(currentOrder.id).padStart(4, '0');

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderNumber);
    toast({
      title: "Copié !",
      description: "Le numéro de commande a été copié dans le presse-papier"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <Card className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-bold">Commande confirmée !</h1>
          <p className="text-gray-600">
            Merci pour votre commande. Voici les détails de votre achat.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Numéro de commande</p>
              <p className="font-semibold">#{orderNumber}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyOrderId}>
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="font-semibold">Statut de la commande</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <Package className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Commande reçue</p>
                  <p className="text-sm text-gray-500">
                    Nous avons bien reçu votre commande
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Truck className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Livraison</p>
                  <p className="text-sm text-gray-500">
                    {currentOrder.shipping.method}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Adresse de livraison</p>
                  <p className="text-sm text-gray-500">
                    {currentOrder.shipping.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Délai estimé</p>
                  <p className="text-sm text-gray-500">
                    {currentOrder.shipping.estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="font-semibold">Récapitulatif</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{(currentOrder.total - currentOrder.deliveryFee).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span>{currentOrder.deliveryFee.toLocaleString()} FCFA</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{currentOrder.total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}