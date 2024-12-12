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

// Add health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  res.send(healthcheck);
});

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
    console.log('Starting server initialization...');
    
    // Verify environment variables
    const requiredEnvVars = ['DATABASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    console.log('Attempting database connection...');
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check endpoint available at /health`);
      console.log(`Frontend URL configured as: ${process.env.FRONTEND_URL || '*'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Log additional details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    process.exit(1);
  }
};

startServer();