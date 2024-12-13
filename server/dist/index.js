"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
});
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 3000;
// Basic middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Health check endpoint
app.get('/health', (_req, res) => {
    console.log('Health check requested');
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: port
        }
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'Server is running' });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield prisma.$connect();
        console.log('Database connection successful');
        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log('Environment:', process.env.NODE_ENV);
            console.log('Frontend URL:', process.env.FRONTEND_URL || '*');
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        // Don't exit the process, just log the error
        console.log('Server will continue running without database connection');
        // Start the server anyway
        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port} (without database)`);
            console.log('Environment:', process.env.NODE_ENV);
            console.log('Frontend URL:', process.env.FRONTEND_URL || '*');
        });
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process
});
startServer();
