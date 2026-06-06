const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelworld';
mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/world', require('./routes/world'));
app.use('/api/player', require('./routes/player'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/achievement', require('./routes/achievement'));
app.use('/api/chat', require('./routes/chat'));

// Socket.io Events
io.on('connection', (socket) => {
    console.log('👤 Player connected:', socket.id);

    socket.on('join-world', (data) => {
        socket.join(data.worldId);
        socket.broadcast.to(data.worldId).emit('player-joined', {
            playerId: socket.id,
            playerName: data.playerName,
            position: data.position
        });
        console.log(`${data.playerName} joined world ${data.worldId}`);
    });

    socket.on('player-move', (data) => {
        io.to(data.worldId).emit('player-moved', {
            playerId: socket.id,
            position: data.position
        });
    });

    socket.on('place-block', (data) => {
        io.to(data.worldId).emit('block-placed', {
            playerId: socket.id,
            x: data.x,
            y: data.y,
            blockType: data.blockType
        });
    });

    socket.on('remove-block', (data) => {
        io.to(data.worldId).emit('block-removed', {
            playerId: socket.id,
            x: data.x,
            y: data.y
        });
    });

    // Chat events
    socket.on('chat-message', (data) => {
        io.to(data.worldId).emit('new-chat-message', {
            username: data.username,
            message: data.message,
            timestamp: new Date()
        });
        console.log(`[${data.worldId}] ${data.username}: ${data.message}`);
    });

    socket.on('typing', (data) => {
        socket.broadcast.to(data.worldId).emit('user-typing', {
            username: data.username
        });
    });

    socket.on('stop-typing', (data) => {
        socket.broadcast.to(data.worldId).emit('user-stop-typing', {
            username: data.username
        });
    });

    // Achievement event
    socket.on('achievement-unlocked', (data) => {
        io.to(data.worldId).emit('player-achievement', {
            username: data.username,
            achievementName: data.achievementName
        });
        console.log(`${data.username} unlocked: ${data.achievementName}`);
    });

    socket.on('disconnect', () => {
        console.log('👋 Player disconnected:', socket.id);
        io.emit('player-left', { playerId: socket.id });
    });
});

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API: http://localhost:${PORT}/api`);
    console.log(`🎮 Socket.io: ws://localhost:${PORT}`);
});
