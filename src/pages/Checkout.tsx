import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { MapPin, CreditCard, Truck, User, Mail, Wallet } from 'lucide-react';

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
    icon: Wallet
  },
  {
    id: 'card',
    name: 'Carte bancaire',
    description: 'Paiement sécurisé par carte bancaire',
    icon: CreditCard
  },
  {
    id: 'orange',
    name: 'Orange Money',
    description: 'Paiement sécurisé via Orange Money',
    icon: CreditCard
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    description: 'Paiement sécurisé via MTN Mobile Money',
    icon: CreditCard
  },
  {
    id: 'moov',
    name: 'Moov Money',
    description: 'Paiement sécurisé via Moov Money',
    icon: CreditCard
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Paiement sécurisé via Wave',
    icon: CreditCard
  }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { createOrder } = useOrder();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
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

  // Calculer le total du panier
  const cartTotal = getTotalPrice();
  const zone = selectedZone ? ZONES[selectedZone] : null;
  const deliveryPrice = zone?.delivery[deliveryType]?.price || 0;
  const total = cartTotal + deliveryPrice;

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Ajoutez des articles à votre panier pour passer commande</p>
          <Button onClick={() => navigate('/')}>
            Retourner à la boutique
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedZone || !zone || !formData.area || !formData.address) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          brand: item.brand,
          image: item.image
        })),
        total: getTotalPrice() + deliveryPrice,
        deliveryFee: deliveryPrice,
        deliveryType,
        paymentMethod,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.area,
          zone: ZONES[selectedZone].name
        }
      };

      await createOrder(orderData);
      
      // Vider le panier après la commande réussie
      clearCart();
      
      toast({
        title: "Commande validée",
        description: "Votre commande a été enregistrée avec succès"
      });
      
      navigate('/order-history');
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section Informations personnelles */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+225</span>
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-16"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="XX XX XX XX XX"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Adresse de livraison */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse de livraison
            </h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="zone">Zone</Label>
                <Select
                  value={selectedZone}
                  onValueChange={(value) => setSelectedZone(value as keyof typeof ZONES)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ZONES).map(([key, zone]) => (
                      <SelectItem key={key} value={key}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedZone && (
                <div>
                  <Label htmlFor="area">Quartier</Label>
                  <Select
                    value={formData.area}
                    onValueChange={(value) => setFormData({ ...formData, area: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un quartier" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES[selectedZone].areas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Récapitulatif et Paiement */}
        <div className="space-y-6">
          {/* Section Mode de livraison */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Mode de livraison
            </h2>
            {selectedZone && (
              <RadioGroup
                value={deliveryType}
                onValueChange={(value) => setDeliveryType(value as 'rapid' | 'normal')}
              >
                <div className="grid gap-4">
                  {Object.entries(ZONES[selectedZone].delivery).map(([key, option]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={`delivery-${key}`} />
                      <Label htmlFor={`delivery-${key}`} className="flex-1">
                        <div className="flex justify-between">
                          <span>{option.label}</span>
                          <span>{option.price.toLocaleString()} FCFA</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Section Mode de paiement */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Mode de paiement
            </h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="grid gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card key={method.id} className={`p-4 cursor-pointer transition-colors ${paymentMethod === method.id ? 'ring-2 ring-purple-600' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                        <Label htmlFor={`payment-${method.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.description}</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Section Récapitulatif */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Récapitulatif de la commande</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
              
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{deliveryPrice.toLocaleString()} FCFA</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={items.length === 0}
            >
              Valider la commande
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}