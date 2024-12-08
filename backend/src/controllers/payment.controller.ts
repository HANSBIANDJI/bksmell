import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Ces fonctions sont des placeholders - à implémenter avec votre logique de paiement
export async function getPaymentMethods(req: Request, res: Response) {
  try {
    const methods = [
      {
        id: 'orange-money',
        type: 'MOBILE_MONEY',
        provider: 'ORANGE',
        name: 'Orange Money',
        icon: '/icons/orange-money.png',
        enabled: true
      },
      {
        id: 'mtn-money',
        type: 'MOBILE_MONEY',
        provider: 'MTN',
        name: 'MTN Mobile Money',
        icon: '/icons/mtn-money.png',
        enabled: true
      },
      {
        id: 'moov-money',
        type: 'MOBILE_MONEY',
        provider: 'MOOV',
        name: 'Moov Money',
        icon: '/icons/moov-money.png',
        enabled: true
      },
      {
        id: 'wave',
        type: 'MOBILE_MONEY',
        provider: 'WAVE',
        name: 'Wave',
        icon: '/icons/wave.png',
        enabled: true
      }
    ];

    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching payment methods' });
  }
}

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      metadata: { orderId },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        status: PaymentStatus.PENDING,
        paymentIntentId: paymentIntent.id,
        provider: 'stripe',
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return res.status(500).json({ error: 'Error creating payment intent' });
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'No signature found' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    let result;

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find payment by paymentIntentId
        const payment = await prisma.payment.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (payment) {
          // Update payment status
          result = await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.SUCCEEDED },
          });
        }

        return res.json({ received: true, result });
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find payment by paymentIntentId
        const payment = await prisma.payment.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (payment) {
          // Update payment status
          result = await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
          });
        }

        return res.json({ received: true, result });
      }
      default: {
        return res.json({ received: true, message: 'Unhandled event type' });
      }
    }
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(400).json({ error: 'Webhook error' });
  }
};

export async function confirmPayment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Confirmer le paiement avec votre fournisseur de paiement
    const paymentIntent = await prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.SUCCEEDED }
    });

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: 'Error confirming payment' });
  }
}

export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const paymentIntent = await prisma.payment.findUnique({
      where: { id }
    });

    if (!paymentIntent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching payment status' });
  }
}