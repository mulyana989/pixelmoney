// Server Configuration
const SERVER_URL = 'http://localhost:5000';
let socket = null;
let currentUser = null;
let currentWorldId = null;
let onlinePlayers = {};

// Initialize Socket.io
function initializeSocket() {
    socket = io(SERVER_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('✅ Connected to server');
        updateConnectionStatus(true);
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        updateConnectionStatus(false);
    });

    // Multiplayer events
    socket.on('player-joined', (data) => {
        console.log('👤 Player joined:', data.playerName);
        onlinePlayers[data.playerId] = data;
        updateOnlinePlayersCount();
    });

    socket.on('player-moved', (data) => {
        // Handle other player movement
        if (data.playerId !== socket.id) {
            console.log('Player moved:', data.playerId, data.position);
        }
    });

    socket.on('block-placed', (data) => {
        if (data.playerId !== socket.id) {
            pixelWorld.world.set(`${data.x},${data.y}`, data.blockType);
        }
    });

    socket.on('block-removed', (data) => {
        if (data.playerId !== socket.id) {
            pixelWorld.world.delete(`${data.x},${data.y}`);
        }
    });

    socket.on('player-left', (data) => {
        console.log('👋 Player left:', data.playerId);
        delete onlinePlayers[data.playerId];
        updateOnlinePlayersCount();
    });
}

// Authentication
function register() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    if (!username || !password) {
        alert('Username dan password tidak boleh kosong!');
        return;
    }

    fetch(`${SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            email: `${username}@pixelworld.local`,
            password
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            alert(`✅ Register berhasil! Welcome, ${username}!`);
            showWorldSection();
            loadUserWorlds();
        } else {
            alert(`❌ Register gagal: ${data.message}`);
        }
    })
    .catch(err => {
        console.error('Register error:', err);
        alert('❌ Error register!');
    });
}

function login() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    if (!username || !password) {
        alert('Username dan password tidak boleh kosong!');
        return;
    }

    fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            alert(`✅ Login berhasil! Welcome back, ${username}!`);
            showWorldSection();
            loadUserWorlds();
        } else {
            alert(`❌ Login gagal: ${data.message}`);
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        alert('❌ Error login!');
    });
}

function showWorldSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('world-section').style.display = 'block';
    document.getElementById('player-name').textContent = `Player: ${currentUser.username}`;
}

// World Management
function createWorld() {
    const worldName = document.getElementById('world-name').value;
    const token = localStorage.getItem('token');

    if (!worldName) {
        alert('Nama world tidak boleh kosong!');
        return;
    }

    if (!token) {
        alert('Silakan login dulu!');
        return;
    }

    fetch(`${SERVER_URL}/api/world/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: worldName })
    })
    .then(res => res.json())
    .then(data => {
        if (data.world) {
            alert(`✅ World "${worldName}" created!`);
            document.getElementById('world-name').value = '';
            loadUserWorlds();
        } else {
            alert(`❌ Create world gagal: ${data.message}`);
        }
    })
    .catch(err => {
        console.error('Create world error:', err);
        alert('❌ Error create world!');
    });
}

function loadUserWorlds() {
    const token = localStorage.getItem('token');

    if (!token) return;

    fetch(`${SERVER_URL}/api/world/user/worlds`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(worlds => {
        const select = document.getElementById('world-select');
        select.innerHTML = '';
        
        worlds.forEach(world => {
            const option = document.createElement('option');
            option.value = world.worldId;
            option.textContent = `${world.name} (${world.width}x${world.height})`;
            select.appendChild(option);
        });
    })
    .catch(err => console.error('Load worlds error:', err));
}

function joinWorld() {
    const worldId = document.getElementById('world-select').value;
    const token = localStorage.getItem('token');

    if (!worldId) {
        alert('Pilih world dulu!');
        return;
    }

    if (!token) {
        alert('Silakan login dulu!');
        return;
    }

    currentWorldId = worldId;

    // Join world via Socket.io
    socket.emit('join-world', {
        worldId: worldId,
        playerName: currentUser.username,
        position: { x: pixelWorld.playerX, y: pixelWorld.playerY }
    });

    // Load world data
    fetch(`${SERVER_URL}/api/world/${worldId}`)
        .then(res => res.json())
        .then(data => {
            pixelWorld.world.clear();
            
            if (data.blocks && Array.isArray(data.blocks)) {
                data.blocks.forEach(([key, blockId]) => {
                    pixelWorld.world.set(key, blockId);
                });
            }
            
            alert(`✅ Joined world: ${data.name}`);
        })
        .catch(err => console.error('Load world error:', err));
}

// Save world to server
function saveWorldToServer() {
    if (!currentWorldId || !currentUser) {
        console.log('Not in a world');
        return;
    }

    const token = localStorage.getItem('token');
    const blocks = Array.from(pixelWorld.world.entries());

    fetch(`${SERVER_URL}/api/world/${currentWorldId}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blocks })
    })
    .then(res => res.json())
    .then(data => {
        console.log('✅ World saved to server');
    })
    .catch(err => console.error('Save world error:', err));
}

// Update player position on server
function updatePlayerPosition() {
    if (!currentWorldId) return;

    socket.emit('player-move', {
        worldId: currentWorldId,
        position: { x: pixelWorld.playerX, y: pixelWorld.playerY }
    });
}

// Update UI
function updateConnectionStatus(isConnected) {
    const status = document.getElementById('connection-status');
    if (isConnected) {
        status.textContent = '🟢 Online';
        status.style.color = '#2ecc71';
    } else {
        status.textContent = '🔴 Offline';
        status.style.color = '#e74c3c';
    }
}

function updateOnlinePlayersCount() {
    const count = Object.keys(onlinePlayers).length;
    document.getElementById('online-players').textContent = `Online: ${count}`;
}

// Sync block placement with server
function syncBlockPlacement(x, y, blockType) {
    if (!currentWorldId) return;

    socket.emit('place-block', {
        worldId: currentWorldId,
        x, y,
        blockType
    });
}

function syncBlockRemoval(x, y) {
    if (!currentWorldId) return;

    socket.emit('remove-block', {
        worldId: currentWorldId,
        x, y
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Load saved user if exists
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
        currentUser = JSON.parse(savedUser);
        showWorldSection();
        loadUserWorlds();
    }

    // Setup event listeners
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('create-world-btn').addEventListener('click', createWorld);
    document.getElementById('join-world-btn').addEventListener('click', joinWorld);

    // Initialize Socket.io
    setTimeout(() => {
        initializeSocket();
    }, 500);

    // Auto-save world every 30 seconds
    setInterval(() => {
        saveWorldToServer();
    }, 30000);

    // Update player position every 2 seconds
    setInterval(() => {
        updatePlayerPosition();
    }, 2000);
});