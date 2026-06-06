const TILE_SIZE = 32;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 100;
const CHUNK_SIZE = 10;

// Block types
const BLOCK_TYPES = {
    GRASS: { id: 1, name: 'Grass', color: '#2ecc71', emoji: '🌱' },
    DIRT: { id: 2, name: 'Dirt', color: '#8B4513', emoji: '🟤' },
    STONE: { id: 3, name: 'Stone', color: '#808080', emoji: '⬜' },
    SAND: { id: 4, name: 'Sand', color: '#FFD700', emoji: '🟨' },
    WATER: { id: 5, name: 'Water', color: '#3498db', emoji: '💧' },
    WOOD: { id: 6, name: 'Wood', color: '#8B4513', emoji: '🪵' }
};

class PixelWorld {
    constructor() {
        this.world = new Map();
        this.selectedBlock = BLOCK_TYPES.GRASS;
        this.playerX = Math.floor(WORLD_WIDTH / 2);
        this.playerY = Math.floor(WORLD_HEIGHT / 2);
        this.inventory = {
            [BLOCK_TYPES.GRASS.id]: 50,
            [BLOCK_TYPES.DIRT.id]: 30,
            [BLOCK_TYPES.STONE.id]: 20,
            [BLOCK_TYPES.SAND.id]: 15,
            [BLOCK_TYPES.WATER.id]: 10,
            [BLOCK_TYPES.WOOD.id]: 25
        };
        this.generateWorld();
    }

    generateWorld() {
        // Simple terrain generation
        for (let x = 0; x < WORLD_WIDTH; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                const key = `${x},${y}`;
                
                // Add some variation to terrain
                if (y > 50) {
                    this.world.set(key, BLOCK_TYPES.DIRT.id);
                } else if (y > 45) {
                    this.world.set(key, BLOCK_TYPES.GRASS.id);
                } else if (Math.random() > 0.7) {
                    this.world.set(key, BLOCK_TYPES.STONE.id);
                }
            }
        }

        // Add some water
        for (let x = 20; x < 30; x++) {
            for (let y = 60; y < 65; y++) {
                this.world.set(`${x},${y}`, BLOCK_TYPES.WATER.id);
            }
        }
    }

    placeBlock(x, y) {
        if (this.inventory[this.selectedBlock.id] > 0) {
            this.world.set(`${x},${y}`, this.selectedBlock.id);
            this.inventory[this.selectedBlock.id]--;
            updateInventoryUI();
        }
    }

    removeBlock(x, y) {
        const key = `${x},${y}`;
        if (this.world.has(key)) {
            const blockId = this.world.get(key);
            this.world.delete(key);
            this.inventory[blockId] = (this.inventory[blockId] || 0) + 1;
            updateInventoryUI();
        }
    }

    movePlayer(dx, dy) {
        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        if (newX >= 0 && newX < WORLD_WIDTH && newY >= 0 && newY < WORLD_HEIGHT) {
            this.playerX = newX;
            this.playerY = newY;
        }
    }

    getBlock(x, y) {
        const key = `${x},${y}`;
        const blockId = this.world.get(key);
        if (!blockId) return null;

        for (const block of Object.values(BLOCK_TYPES)) {
            if (block.id === blockId) return block;
        }
        return null;
    }

    saveGame() {
        const data = {
            world: Array.from(this.world.entries()),
            playerX: this.playerX,
            playerY: this.playerY,
            inventory: this.inventory,
            selectedBlock: this.selectedBlock.id
        };
        localStorage.setItem('pixelworld_save', JSON.stringify(data));
        console.log('Game saved!');
    }

    loadGame() {
        const data = localStorage.getItem('pixelworld_save');
        if (data) {
            const parsed = JSON.parse(data);
            this.world = new Map(parsed.world);
            this.playerX = parsed.playerX;
            this.playerY = parsed.playerY;
            this.inventory = parsed.inventory;
            
            for (const block of Object.values(BLOCK_TYPES)) {
                if (block.id === parsed.selectedBlock) {
                    this.selectedBlock = block;
                    break;
                }
            }
            updateInventoryUI();
            console.log('Game loaded!');
            return true;
        }
        return false;
    }

    clearWorld() {
        this.world.clear();
        console.log('World cleared!');
    }
}

let pixelWorld = new PixelWorld();
let gameConfig = {
    type: Phaser.CANVAS,
    width: 1024,
    height: 768,
    render: {
        pixelArt: true,
        antialias: false
    },
    scene: {
        create: create,
        update: update,
        render: renderGame
    }
};

let game = new Phaser.Game(gameConfig);
let cameraOffsetX = 0;
let cameraOffsetY = 0;
let keys = {};

function create() {
    const input = this.input;
    
    input.on('pointerdown', (pointer) => {
        const worldX = Math.floor((pointer.x + cameraOffsetX) / TILE_SIZE);
        const worldY = Math.floor((pointer.y + cameraOffsetY) / TILE_SIZE);

        if (pointer.button === 0) {
            // Left click - place block
            pixelWorld.placeBlock(worldX, worldY);
        } else if (pointer.button === 2) {
            // Right click - remove block
            pixelWorld.removeBlock(worldX, worldY);
        }
    });

    input.keyboard.on('keydown', (event) => {
        const key = event.key.toLowerCase();
        keys[key] = true;

        if (key === 's') {
            pixelWorld.saveGame();
        } else if (key === 'l') {
            pixelWorld.loadGame();
        } else if (key === 'c') {
            if (confirm('Clear the entire world? This cannot be undone!')) {
                pixelWorld.clearWorld();
            }
        } else if (key >= '1' && key <= '6') {
            const index = parseInt(key) - 1;
            const blockArray = Object.values(BLOCK_TYPES);
            if (index < blockArray.length) {
                pixelWorld.selectedBlock = blockArray[index];
                updateInventoryUI();
            }
        }
    });

    input.keyboard.on('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });

    updateInventoryUI();
}

function update() {
    // Player movement
    const speed = 1;
    if (keys['arrowup'] || keys['w']) pixelWorld.movePlayer(0, -speed);
    if (keys['arrowdown'] || keys['s']) pixelWorld.movePlayer(0, speed);
    if (keys['arrowleft'] || keys['a']) pixelWorld.movePlayer(-speed, 0);
    if (keys['arrowright'] || keys['d']) pixelWorld.movePlayer(speed, 0);

    // Update camera to follow player
    cameraOffsetX = pixelWorld.playerX * TILE_SIZE - 512 + TILE_SIZE / 2;
    cameraOffsetY = pixelWorld.playerY * TILE_SIZE - 384 + TILE_SIZE / 2;

    // Clamp camera
    cameraOffsetX = Math.max(0, Math.min(cameraOffsetX, WORLD_WIDTH * TILE_SIZE - 1024));
    cameraOffsetY = Math.max(0, Math.min(cameraOffsetY, WORLD_HEIGHT * TILE_SIZE - 768));

    // Update coordinates display
    document.getElementById('coords').textContent = 
        `Position: ${pixelWorld.playerX}, ${pixelWorld.playerY}`;
}

function drawPlayer(ctx, screenX, screenY) {
    // Draw player body - bigger and brighter
    ctx.fillStyle = '#FFD700'; // Gold color - very visible!
    ctx.fillRect(screenX + 2, screenY + 2, 28, 28);
    
    // Draw body outline - strong border
    ctx.strokeStyle = '#FF6B00'; // Orange outline
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX + 2, screenY + 2, 28, 28);
    
    // Draw left eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(screenX + 7, screenY + 8, 4, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(screenX + 8, screenY + 8, 2, 2);
    
    // Draw right eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(screenX + 19, screenY + 8, 4, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(screenX + 20, screenY + 8, 2, 2);
    
    // Draw mouth - smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(screenX + 16, screenY + 18, 3, 0, Math.PI, false);
    ctx.stroke();
    
    // Draw arms
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(screenX - 2, screenY + 10, 4, 10); // Left arm
    ctx.fillRect(screenX + 28, screenY + 10, 4, 10); // Right arm
    
    // Draw arms outline
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX - 2, screenY + 10, 4, 10);
    ctx.strokeRect(screenX + 28, screenY + 10, 4, 10);
    
    // Draw legs
    ctx.fillStyle = '#333333';
    ctx.fillRect(screenX + 7, screenY + 28, 4, 4); // Left leg
    ctx.fillRect(screenX + 19, screenY + 28, 4, 4); // Right leg
}

function renderGame(game) {
    const ctx = game.canvas.getContext('2d');
    const viewportWidth = game.canvas.width;
    const viewportHeight = game.canvas.height;

    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Calculate visible tiles
    const startX = Math.floor(cameraOffsetX / TILE_SIZE);
    const startY = Math.floor(cameraOffsetY / TILE_SIZE);
    const endX = startX + Math.ceil(viewportWidth / TILE_SIZE) + 1;
    const endY = startY + Math.ceil(viewportHeight / TILE_SIZE) + 1;

    // Draw tiles
    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) continue;

            const block = pixelWorld.getBlock(x, y);
            if (block) {
                const screenX = x * TILE_SIZE - cameraOffsetX;
                const screenY = y * TILE_SIZE - cameraOffsetY;

                ctx.fillStyle = block.color;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                // Draw border
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw player with better visibility
    const playerScreenX = pixelWorld.playerX * TILE_SIZE - cameraOffsetX;
    const playerScreenY = pixelWorld.playerY * TILE_SIZE - cameraOffsetY;
    
    drawPlayer(ctx, playerScreenX, playerScreenY);

    // Draw selected block indicator - green glow
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.fillRect(playerScreenX, playerScreenY, TILE_SIZE, TILE_SIZE);
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(playerScreenX, playerScreenY, TILE_SIZE, TILE_SIZE);

    // Update FPS
    const fps = Math.round(game.loop.actualFps);
    document.getElementById('fps').textContent = `FPS: ${fps}`;
}

function updateInventoryUI() {
    const container = document.getElementById('inventory-items');
    container.innerHTML = '';

    for (const block of Object.values(BLOCK_TYPES)) {
        const count = pixelWorld.inventory[block.id] || 0;
        const div = document.createElement('div');
        div.className = 'inventory-item';
        if (pixelWorld.selectedBlock.id === block.id) {
            div.classList.add('selected');
        }
        div.innerHTML = `<div>${block.emoji}</div><div style="font-size: 10px; margin-top: 2px;">${count}</div>`;
        div.onclick = () => {
            pixelWorld.selectedBlock = block;
            updateInventoryUI();
        };
        container.appendChild(div);
    }
}
