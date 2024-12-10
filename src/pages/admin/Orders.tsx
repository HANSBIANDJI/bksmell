import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Calendar, User, Phone, MapPin, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { useOrder } from '@/contexts/OrderContext';
import { useMediaQuery } from '@/hooks/use-media-query';

const STATUS_COLORS = {
  pending: 'text-yellow-500',
  processing: 'text-blue-500',
  shipped: 'text-purple-500',
  delivered: 'text-green-500',
  cancelled: 'text-red-500',
};

const STATUS_LABELS = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { orders, updateOrderStatus } = useOrder();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const filteredOrders = orders.filter(order =>
    order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(order.id).includes(searchTerm)
  );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande"
      });
    }
  };

  const columns = [
    { key: 'id', label: 'Commande' },
    { key: 'client', label: 'Client' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Statut' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderCell = (order, column) => {
    switch (column.key) {
      case 'id':
        return `#${String(order.id).padStart(4, '0')}`;
      case 'client':
        return (
          <div>
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
          </div>
        );
      case 'date':
        return format(new Date(order.createdAt), 'PPp', { locale: fr });
      case 'total':
        return `${order.total.toLocaleString()} FCFA`;
      case 'status':
        return (
          <Badge className={STATUS_COLORS[order.status]}>
            {STATUS_LABELS[order.status]}
          </Badge>
        );
      case 'actions':
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedOrder(order);
              setIsDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Commandes</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom ou numéro de commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 border border-gray-200 rounded">
              <h3 className="font-semibold mb-2">Commande #{String(order.id).padStart(4, '0')}</h3>
              <p className="text-sm text-gray-500">Client: {order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-500">Date: {format(new Date(order.createdAt), 'PPp', { locale: fr })}</p>
              <p className="text-sm text-gray-500">Total: {order.total.toLocaleString()} FCFA</p>
              <Badge className={STATUS_COLORS[order.status]}>
                {STATUS_LABELS[order.status]}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDialogOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          {columns.map((column) => (
                            <td
                              key={`${order.id}-${column.key}`}
                              className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                            >
                              {renderCell(order, column)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-xl md:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Détails de la commande #{selectedOrder && String(selectedOrder.id).padStart(4, '0')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Statut de la commande</h3>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-500">
                  Commande passée le {format(new Date(selectedOrder.createdAt), 'PPp', { locale: fr })}
                </div>
              </div>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Articles commandés</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.brand}</p>
                        <p className="text-sm">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                        <p className="text-sm text-gray-600 whitespace-nowrap">
                          {item.price.toLocaleString()} FCFA/unité
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{(selectedOrder.total - selectedOrder.deliveryFee).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>{selectedOrder.deliveryFee.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{selectedOrder.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Informations de livraison</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Client</p>
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.email}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Adresse de livraison</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}</p>
                    <p>{selectedOrder.shippingAddress.zone}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}