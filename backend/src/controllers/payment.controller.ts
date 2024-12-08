import { Request, Response } from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
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

export const createPaymentIntent = async (_req: Request, res: Response) => {
  try {
    const { amount, orderId } = _req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: {
        orderId
      }
    });

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        status: 'PENDING',
        provider: 'stripe',
        stripePaymentIntentId: paymentIntent.id
      }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      payment
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating payment intent', error });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig || typeof sig !== 'string') {
      return res.status(400).json({ message: 'Missing stripe signature' });
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      await prisma.payment.update({
        where: {
          orderId
        },
        data: {
          status: 'SUCCEEDED'
        }
      });

      await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          status: 'PROCESSING'
        }
      });
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error handling webhook', error });
  }
};

export async function confirmPayment(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Confirmer le paiement avec votre fournisseur de paiement
    const paymentIntent = await prisma.paymentIntent.update({
      where: { id },
      data: { status: 'succeeded' }
    });

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: 'Error confirming payment' });
  }
}

export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const paymentIntent = await prisma.paymentIntent.findUnique({
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