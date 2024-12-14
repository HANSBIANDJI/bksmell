import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Package, Clock, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, Truck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const ORDER_STATUS = {
  pending: { label: 'En attente', color: 'text-yellow-500', icon: Clock },
  processing: { label: 'En cours', color: 'text-blue-500', icon: RefreshCw },
  shipped: { label: 'Expédié', color: 'text-purple-500', icon: Truck },
  delivered: { label: 'Livré', color: 'text-green-500', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'text-red-500', icon: XCircle },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const { orders } = useOrder();
  const [activeTab, setActiveTab] = useState('orders');
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL,
      });
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été mises à jour avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du profil',
        variant: 'destructive',
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {orders.length > 0 ? (
              orders.map((order) => {
                const StatusIcon = ORDER_STATUS[order.status].icon;
                const orderNumber = String(order.id).padStart(4, '0');
                
                return (
                  <motion.div key={order.id} variants={item}>
                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${ORDER_STATUS[order.status].color}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">Commande #{orderNumber}</h3>
                              <Badge className={ORDER_STATUS[order.status].color}>
                                {ORDER_STATUS[order.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold mb-1">{order.total.toLocaleString()} FCFA</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => navigate(`/order-tracking/${orderNumber}`)}
                          >
                            Suivre
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Articles commandés</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                variants={item}
                className="text-center py-12"
              >
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore passé de commande
                </p>
                <Button onClick={() => navigate('/parfums')}>
                  Découvrir nos parfums
                </Button>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  {formData.photoURL && (
                    <div className="mb-4 relative w-32 h-32 mx-auto">
                      <OptimizedImage
                        src={formData.photoURL}
                        alt="Profile"
                        fill
                        className="rounded-full"
                      />
                    </div>
                  )}
                  <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
                    Photo URL
                  </label>
                  <Input
                    id="photoURL"
                    type="text"
                    value={formData.photoURL}
                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Nom d'affichage
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
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
                    value={formData.email}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  Mettre à jour
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/update-password')}
                  className="flex-1"
                >
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}