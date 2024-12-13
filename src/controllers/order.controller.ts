import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { OrderStatus } from '@prisma/client';

interface OrderItem {
  perfumeId: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, shippingAddress, deliveryFee } = req.body as {
      userId: string;
      items: OrderItem[];
      shippingAddress: ShippingAddress;
      deliveryFee: number;
    };

    // Calculate total from items
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const order = await prisma.order.create({
      data: {
        total, // Now correctly typed as Float
        deliveryFee, // Now correctly typed as Float
        status: OrderStatus.PENDING,
        user: {
          connect: { id: userId }
        },
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price, // Now correctly typed as Float
            perfume: {
              connect: { id: item.perfumeId }
            }
          })),
        },
        shippingAddress: {
          create: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
          },
        },
      },
      include: {
        user: true,
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Error creating order' });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
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
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ error: 'Error fetching order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
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
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: {
        user: true,
        items: {
          include: {
            perfume: true,
          },
        },
        shippingAddress: true,
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: 'Error cancelling order' });
  }
};