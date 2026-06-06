# PixelWorld Private Server 🖥️

Backend server untuk PixelWorld game dengan fitur multiplayer, authentication, dan world persistence.

## 🚀 Features

- 🔐 **Authentication** - Register & Login dengan JWT
- 🌍 **World Management** - Create, save, load worlds
- 👥 **Player Management** - Track player position & inventory
- 🔄 **Real-time Sync** - Socket.io untuk live multiplayer
- 💾 **Database** - MongoDB untuk persistent storage
- 📡 **REST API** - Complete API endpoints

## 🛠️ Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan konfigurasi kamu
```

### 3. Setup MongoDB
```bash
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas (cloud)
# Update MONGODB_URI di .env
```

### 4. Run Server
```bash
# Development
npm run dev

# Production
npm start
```

Server akan running di `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### World
- `POST /api/world/create` - Create world
- `GET /api/world/:worldId` - Get world data
- `POST /api/world/:worldId/save` - Save world
- `GET /api/world/user/worlds` - Get user's worlds

### Player
- `POST /api/player/create` - Create player
- `GET /api/player/:playerId` - Get player data
- `POST /api/player/:playerId/position` - Update position
- `GET /api/player/world/:worldId` - Get world players

## 🔌 Socket.io Events

### Emitted
- `player-joined` - Player joined world
- `player-moved` - Player moved
- `block-placed` - Block placed
- `block-removed` - Block removed
- `player-left` - Player disconnected

### Listen
- `join-world` - Join world
- `player-move` - Move position
- `place-block` - Place block
- `remove-block` - Remove block

## 📁 Project Structure

```
server/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment example
├── models/                # MongoDB models
│   ├── User.js
│   ├── World.js
│   └── Player.js
├── routes/                # API routes
│   ├── auth.js
│   ├── world.js
│   └── player.js
└── middleware/            # Middleware
    └── auth.js
```

## 🔑 Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pixelworld
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:8000
```

## 💡 Next Steps

1. Connect game client ke server
2. Implement real-time multiplayer
3. Add leaderboard system
4. Add world sharing
5. Add achievements

## 📞 Support

Untuk help, buka issue atau hubungi developer.

---

**Made with ❤️ by mulyana989**
