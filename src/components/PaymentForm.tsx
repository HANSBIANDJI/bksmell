'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';
import { Loader2 } from 'lucide-react';
import React from 'react';

const paymentFormSchema = z.object({
  cardNumber: z.string().min(16).max(16),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
  cvv: z.string().min(3).max(4),
  name: z.string().min(2),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
}

export function PaymentForm({ onSubmit }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: '/icons/credit-card.svg',
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: '/icons/mobile-money.svg',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Numéro de carte</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          {...register('cardNumber')}
        />
        {errors.cardNumber && (
          <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Date d'expiration</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            {...register('expiryDate')}
          />
          {errors.expiryDate && (
            <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="password"
            placeholder="123"
            {...register('cvv')}
          />
          {errors.cvv && (
            <p className="text-sm text-red-500">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom sur la carte</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <PaymentMethodSelector
        methods={paymentMethods}
        selectedMethod={selectedMethod}
        onSelect={setSelectedMethod}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          'Payer'
        )}
      </Button>
    </form>
  );
}