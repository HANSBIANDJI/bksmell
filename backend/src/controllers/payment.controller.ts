import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function getPaymentMethods(_req: Request, res: Response) {
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

    return res.json(methods);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching payment methods' });
  }
}

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents and ensure it's an integer
      currency: 'xof',
      payment_method_types: ['card'],
      metadata: { orderId },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: amount.toString(), // Convert to string as per Prisma schema
        status: PaymentStatus.PENDING,
        provider: 'stripe',
        paymentIntentId: paymentIntent.id,
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

const handlePaymentSuccess = async (session: Stripe.PaymentIntent) => {
  const payment = await prisma.payment.findFirst({
    where: { paymentIntentId: session.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCEEDED },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'PROCESSING' },
    });
  }
};

const handlePaymentFailure = async (session: Stripe.PaymentIntent) => {
  const payment = await prisma.payment.findFirst({
    where: { paymentIntentId: session.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CANCELLED' },
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    const session = event.data.object as Stripe.PaymentIntent;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(session);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(session);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.SUCCEEDED }
    });

    return res.json(payment);
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(500).json({ error: 'Error confirming payment' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const paymentIntent = await prisma.payment.findUnique({
      where: { id }
    });

    if (!paymentIntent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }

    return res.json(paymentIntent);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching payment status' });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(payment);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching payment' });
  }
};