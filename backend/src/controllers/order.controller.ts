import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { OrderStatus } from '@prisma/client';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, total, deliveryFee, shippingAddress } = req.body;

    const order = await prisma.order.create({
      data: {
        userId: Number(userId),
        total,
        deliveryFee,
        status: OrderStatus.PENDING,
        items: {
          create: items.map((item: any) => ({
            perfumeId: item.perfumeId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        shippingAddress: {
          create: shippingAddress,
        },
      },
      include: {
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
      },
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Error creating order' });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ error: 'Error fetching orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({ error: 'Error fetching order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ error: 'Error updating order status' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: 'Error cancelling order' });
  }
};