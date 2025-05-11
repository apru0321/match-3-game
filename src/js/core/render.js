import { GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, ALL_COLORS } from '../constants.js';

export function render(ctx, board, selectedTile, animations, shapeCanvases, TILE_SIZE) {
    try {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        for (let i = 0; i <= GRID_WIDTH; i++) {
            ctx.beginPath();
            ctx.moveTo(i * TILE_SIZE, 0);
            ctx.lineTo(i * TILE_SIZE, ctx.canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= GRID_HEIGHT; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * TILE_SIZE);
            ctx.lineTo(ctx.canvas.width, i * TILE_SIZE);
            ctx.stroke();
        }

        if (!board || !Array.isArray(board)) {
            console.warn('render: board is not initialized');
            return;
        }

        for (let row = 0; row < GRID_HEIGHT; row++) {
            if (!board[row] || !Array.isArray(board[row])) {
                console.warn(`render: board[${row}] is undefined or not an array`);
                continue;
            }
            for (let col = 0; col < GRID_WIDTH; col++) {
                const tile = board[row][col];
                if (tile) {
                    ctx.fillStyle = tile.bonusType ? '#444444' : ALL_COLORS[tile.type];
                    const x = tile.x + TILE_SIZE / 2;
                    const y = tile.y + TILE_SIZE / 2;
                    let size = TILE_SIZE - 8;

                    if (tile.disappearing) {
                        tile.disappearProgress = Math.min(1, tile.disappearProgress + 0.016);
                        size *= (1 - tile.disappearProgress);
                        ctx.globalAlpha = 1 - tile.disappearProgress;
                        if (tile.disappearProgress >= 1) {
                            board[row][col] = null;
                        }
                    } else {
                        ctx.globalAlpha = 1;
                    }

                    if (tile.bonusType === 'horizontal_arrow') {
                        ctx.beginPath();
                        ctx.moveTo(x - size / 2, y);
                        ctx.lineTo(x + size / 2, y);
                        ctx.moveTo(x + size / 2 - 5, y - 5);
                        ctx.lineTo(x + size / 2, y);
                        ctx.lineTo(x + size / 2 - 5, y + 5);
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    } else if (tile.bonusType === 'vertical_arrow') {
                        ctx.beginPath();
                        ctx.moveTo(x, y - size / 2);
                        ctx.lineTo(x, y + size / 2);
                        ctx.moveTo(x - 5, y + size / 2 - 5);
                        ctx.lineTo(x, y + size / 2);
                        ctx.lineTo(x + 5, y + size / 2 - 5);
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 3;
                        ctx.stroke();
_PRIOR_TEXT_CUT_OFF_ 
                    } else if (tile.bonusType === 'bonus_star') {
                        ctx.beginPath();
                        for (let i = 0; i < 10; i++) {
                            const radius = i % 2 === 0 ? size / 2 : size / 3;
                            const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
                            const px = x + radius * Math.cos(angle);
                            const py = y + radius * Math.sin(angle);
                            if (i === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                        ctx.closePath();
                        ctx.fillStyle = '#ffd700';
                        ctx.fill();
                    } else {
                        switch (ALL_SHAPES[tile.type]) {
                            case 'square':
                                ctx.beginPath();
                                ctx.rect(x - size / 2, y - size / 2, size, size);
                                ctx.fill();
                                break;
                            case 'circle':
                                ctx.beginPath();
                                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                                ctx.fill();
                                break;
                            case 'triangle':
                                ctx.beginPath();
                                const height = (size * Math.sqrt(3)) / 2;
                                ctx.moveTo(x, y - height / 2);
                                ctx.lineTo(x - size / 2, y + height / 2);
                                ctx.lineTo(x + size / 2, y + height / 2);
                                ctx.closePath();
                                ctx.fill();
                                break;
                        }
                    }

                    ctx.globalAlpha = 1;

                    if (selectedTile && selectedTile.row === row && selectedTile.col === col) {
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 4;
                        ctx.beginPath();
                        ctx.rect(tile.x + 2, tile.y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                        ctx.stroke();
                    }
                }
            }
        }

        updateAnimations(board, animations, TILE_SIZE);
        if (animations.length > 0 || board.some(row => Array.isArray(row) && row.some(tile => tile && tile.disappearing))) {
            requestAnimationFrame(() => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize));
        }
    } catch (e) {
        console.error(`Error in render: ${e.message}`);
    }
}

export function updateAnimations(board, animations, TILE_SIZE) {
    try {
        animations = animations.filter(anim => {
            const tile = board[anim.row]?.[anim.col];
            if (!tile) return false;
            const dx = (tile.targetX - tile.x) * 0.2;
            const dy = (tile.targetY - tile.y) * 0.2;
            tile.x += dx;
            tile.y += dy;
            return Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
        });
    } catch (e) {
        console.error(`Error in updateAnimations: ${e.message}`);
    }
}

export function createShapeCanvas(shape, color, shapeCanvases) {
    try {
        if (shapeCanvases[shape]) return shapeCanvases[shape];
        const c = document.createElement('canvas');
        c.width = 18;
        c.height = 18;
        const ctx = c.getContext('2d');
        ctx.fillStyle = color;
        const x = 9, y = 9, size = 14;
        switch (shape) {
            case 'square':
                ctx.beginPath();
                ctx.rect(x - size / 2, y - size / 2, size, size);
                ctx.fill();
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.beginPath();
                const height = (size * Math.sqrt(3)) / 2;
                ctx.moveTo(x, y - height / 2);
                ctx.lineTo(x - size / 2, y + height / 2);
                ctx.lineTo(x + size / 2, y + height / 2);
                ctx.closePath();
                ctx.fill();
                break;
        }
        shapeCanvases[shape] = c;
        return c;
    } catch (e) {
        console.error(`Failed to create shape canvas: ${e.message}`);
        return null;
    }
}
