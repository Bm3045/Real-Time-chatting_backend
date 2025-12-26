const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const { authenticateSocket } = require('./middleware/authMiddleware');
const socketHandler = require('./socket/socketHandler');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
    cors: {
        origin: "*",  // Sabhi origins allow karo testing ke liye
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 🔥 IMPORTANT: Body parser middleware add karo
app.use(cors());
app.use(express.json()); // JSON body parse karne ke liye
app.use(express.urlencoded({ extended: true })); // URL-encoded bodies ke liye

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Real-time Chat Backend API' });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO handler
socketHandler(io);

// Database connection
connectDB();

module.exports = { app, server };