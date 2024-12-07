import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './routes';
import { errorHandler } from './middleware/error';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions,
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowEIO3: true
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle countdown updates
  socket.on('countdownUpdate', (countdown) => {
    io.emit('countdownUpdate', countdown);
  });

  // Handle new orders
  socket.on('newOrder', (order) => {
    io.emit('newOrder', order);
  });

  // Handle order status updates
  socket.on('updateOrderStatus', ({ orderId, status }) => {
    io.emit('orderStatusUpdated', { orderId, status });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();