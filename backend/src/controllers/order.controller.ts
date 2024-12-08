import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const { items, shippingAddress, deliveryFee } = req.body;

    // Calculate total
    const total = items.reduce((acc: number, item: any) => {
      return acc + (item.price * item.quantity);
    }, 0) + deliveryFee;

    const order = await prisma.order.create({
      data: {
        items: {
          create: items.map((item: any) => ({
            perfumeId: item.perfumeId,
            quantity: item.quantity,
            price: item.price
          }))
        },
        total,
        deliveryFee,
        status: 'PENDING',
        shippingAddress: {
          create: shippingAddress
        }
      },
      include: {
        items: {
          include: {
            perfume: true
          }
        },
        shippingAddress: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error creating order' });
  }
}

export async function getOrders(_req: Request, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            perfume: true
          }
        },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            perfume: true
          }
        },
        shippingAddress: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order' });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            perfume: true
          }
        },
        shippingAddress: true
      }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status' });
  }
}

export async function cancelOrder(req: Request, res: Response): Promise<void> {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: {
        items: {
          include: {
            perfume: true
          }
        },
        shippingAddress: true
      }
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling order' });
  }
}