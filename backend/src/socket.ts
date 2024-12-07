import { Server, Socket } from 'socket.io';
import { prisma } from './lib/prisma';

export function initializeSocket(io: Server) {
  // CORS configuration
  io.engine.on("initial_headers", (headers: any, req: any) => {
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Credentials"] = "true";
  });

  // Connection handling with error management
  io.on('connection', async (socket: Socket) => {
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
}