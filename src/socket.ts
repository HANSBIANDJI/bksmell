import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { prisma } from './lib/prisma';

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Connection handling with error management
  io.on('connection', async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    try {
      // Send initial data on connection
      const recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      socket.emit('initialOrders', recentOrders);
    } catch (error) {
      console.error('Error fetching initial orders:', error);
    }

    // Handle new orders
    socket.on('newOrder', async (orderData) => {
      try {
        const order = await prisma.order.create({
          data: orderData
        });
        io.emit('orderCreated', order);
      } catch (error) {
        socket.emit('orderError', {
          message: 'Failed to create order',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle order status updates
    socket.on('updateOrderStatus', async ({ orderId, status }) => {
      try {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status }
        });
        io.emit('orderUpdated', order);
      } catch (error) {
        socket.emit('updateError', {
          message: 'Failed to update order',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle order updates
    socket.on('orderUpdate', async (data) => {
      try {
        const { orderId, status } = data;
        io.emit(`order:${orderId}`, { status });
      } catch (error) {
        console.error('Order update error:', error);
      }
    });

    // Handle payment status updates
    socket.on('paymentUpdate', async (data) => {
      try {
        const { orderId, status } = data;
        io.emit(`payment:${orderId}`, { status });
      } catch (error) {
        console.error('Payment update error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Server-side error handling
  io.engine.on('connection_error', (error: Error) => {
    console.error('Connection error:', error);
  });

  return io;
}