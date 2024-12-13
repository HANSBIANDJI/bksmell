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

const PORT = parseInt(process.env.PORT || '3000', 10);

// Add early health check endpoint before any middleware
app.get('/health', (_req, res) => {
  try {
    const healthcheck = {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
      database: prisma ? 'connected' : 'not connected'
    };
    res.status(200).json(healthcheck);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    
    // Start listening first
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check endpoint available at /health`);
      console.log(`Frontend URL configured as: ${process.env.FRONTEND_URL || '*'}`);
    });

    // Then verify environment variables
    const requiredEnvVars = ['DATABASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
      // Continue running but log the error
    }

    // Then attempt database connection
    console.log('Attempting database connection...');
    await prisma.$connect()
      .then(() => console.log('Successfully connected to database'))
      .catch(err => {
        console.error('Failed to connect to database:', err);
        // Continue running but log the error
      });
  } catch (error) {
    console.error('Failed to start server:', error);
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