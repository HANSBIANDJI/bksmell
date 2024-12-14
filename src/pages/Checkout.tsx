import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { OptimizedImage } from '@/components/ui/optimized-image';

const ZONES = {
  'abidjan-nord': {
    name: 'Abidjan Nord',
    areas: ['Plateau', 'Cocody', 'Adjame', 'Abobo', 'Yopougon'],
    delivery: {
      rapid: { price: 2000, label: 'Livraison rapide (24h)' },
      normal: { price: 1000, label: 'Livraison normale (48-72h)' }
    }
  },
  'abidjan-sud': {
    name: 'Abidjan Sud',
    areas: ['Marcory', 'Koumassi', 'Port Bouet'],
    delivery: {
      rapid: { price: 2500, label: 'Livraison rapide (24h)' },
      normal: { price: 1500, label: 'Livraison normale (48-72h)' }
    }
  },
  'hors-zone': {
    name: 'Hors zone',
    areas: ['Autre ville'],
    delivery: {
      normal: { price: 5000, label: 'Livraison (3-5 jours)' }
    }
  }
};

const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Paiement à la livraison',
    description: 'Payez en espèces à la réception de votre commande',
    icon: 'Wallet'
  },
  {
    id: 'card',
    name: 'Carte bancaire',
    description: 'Paiement sécurisé par carte bancaire',
    icon: 'CreditCard'
  },
  {
    id: 'orange',
    name: 'Orange Money',
    description: 'Paiement sécurisé via Orange Money',
    icon: 'CreditCard'
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    description: 'Paiement sécurisé via MTN Mobile Money',
    icon: 'CreditCard'
  },
  {
    id: 'moov',
    name: 'Moov Money',
    description: 'Paiement sécurisé via Moov Money',
    icon: 'CreditCard'
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Paiement sécurisé via Wave',
    icon: 'CreditCard'
  }
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<keyof typeof ZONES | ''>('');
  const [deliveryType, setDeliveryType] = useState<'rapid' | 'normal'>('normal');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    area: '',
    address: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!selectedZone || !formData.area || !formData.address) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Process payment and create order
      // This is where you'd integrate with your payment processor
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Clear cart after successful order
      clearCart();
      
      toast({
        title: 'Commande confirmée',
        description: 'Votre commande a été traitée avec succès',
      });
      
      navigate('/order-confirmation');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du traitement de votre commande',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  const cartTotal = getTotalPrice();
  const zone = selectedZone ? ZONES[selectedZone] : null;
  const deliveryPrice = zone?.delivery[deliveryType]?.price || 0;
  const total = cartTotal + deliveryPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Résumé de la commande</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">Quantité: {item.quantity}</p>
                    <p className="text-gray-600">{item.price.toFixed(2)}€</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Livraison</span>
                <span>{deliveryPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Information de livraison</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
                  Zone
                </label>
                <select
                  id="zone"
                  required
                  value={selectedZone}
                  onChange={(e) =>
                    setSelectedZone(e.target.value as keyof typeof ZONES)
                  }
                  className="mt-1"
                >
                  <option value="">Sélectionner une zone</option>
                  {Object.keys(ZONES).map((key) => (
                    <option key={key} value={key}>
                      {ZONES[key].name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedZone && (
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                    Quartier
                  </label>
                  <select
                    id="area"
                    required
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    className="mt-1"
                  >
                    <option value="">Sélectionner un quartier</option>
                    {ZONES[selectedZone].areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <Input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="deliveryType" className="block text-sm font-medium text-gray-700">
                  Mode de livraison
                </label>
                <select
                  id="deliveryType"
                  required
                  value={deliveryType}
                  onChange={(e) =>
                    setDeliveryType(e.target.value as 'rapid' | 'normal')
                  }
                  className="mt-1"
                >
                  {selectedZone && Object.keys(ZONES[selectedZone].delivery).map((key) => (
                    <option key={key} value={key}>
                      {ZONES[selectedZone].delivery[key].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Mode de paiement
                </label>
                <select
                  id="paymentMethod"
                  required
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="mt-1"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Traitement en cours...' : 'Confirmer la commande'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}