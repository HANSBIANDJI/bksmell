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
const port = process.env.PORT || 3008;
// Basic middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
// Health check endpoint
app.get('/health', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.$queryRaw `SELECT 1`; // Test database connection
        res.status(200).json({ status: 'healthy' });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
}));
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
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield prisma.$connect();
        console.log('Connected to database successfully');
        console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        // Start listening
        httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL environment variable is not set');
        }
        // Exit with error
        process.exit(1);
    }
});
// Start server
startServer();
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Graceful shutdown
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(1);
    });
});
//# sourceMappingURL=index.js.map