import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './routes';
import { errorHandler } from './middleware/error';
import { prisma } from './lib/prisma';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Basic CORS setup
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint (before any other middleware)
app.get('/health', (_req, res) => {
  console.log('Health check requested');
  try {
    const healthcheck = {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
      cwd: process.cwd(),
      port: process.env.PORT,
      pid: process.pid
    };
    console.log('Health check response:', healthcheck);
    res.status(200).json(healthcheck);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
console.log('Starting server...');
console.log('Current working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Process ID:', process.pid);
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'not set',
    FRONTEND_URL: process.env.FRONTEND_URL || 'not set'
  });
});

// Handle process errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Attempt database connection in the background
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));