export function render(ctx, board, selectedTile, animations, shapeCanvases, tileSize) {
    try {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[0].length; col++) {
                const tile = board[row][col];
                if (tile && !tile.disappearing) {
                    const shapeCanvas = shapeCanvases[['square', 'circle', 'triangle'][tile.type]];
                    if (shapeCanvas) {
                        ctx.drawImage(shapeCanvas, tile.x, tile.y, tileSize, tileSize);
                    }
                }
            }
        }
        if (selectedTile) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 4;
            ctx.strokeRect(selectedTile.col * tileSize, selectedTile.row * tileSize, tileSize, tileSize);
        }
    } catch (e) {
        console.error(`Error in render: ${e.message}`);
    }
}

export function updateAnimations(board, animations, tileSize) {
    try {
        let animationComplete = true;
        animations.forEach((anim, index) => {
            const tile = board[anim.row][anim.col];
            if (tile) {
                if (tile.disappearing) {
                    tile.disappearProgress += 0.1;
                    if (tile.disappearProgress >= 1) {
                        animations.splice(index, 1);
                    } else {
                        animationComplete = false;
                    }
                } else {
                    const dx = tile.targetX - tile.x;
                    const dy = tile.targetY - tile.y;
                    tile.x += dx * 0.2;
                    tile.y += dy * 0.2;
                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                        animationComplete = false;
                    }
                }
            }
        });
        return animationComplete;
    } catch (e) {
        console.error(`Error in updateAnimations: ${e.message}`);
        return true;
    }
}

export function createShapeCanvas(shape, color, shapeCanvases) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        if (shape === 'square') {
            ctx.fillRect(5, 5, 40, 40);
        } else if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(25, 25, 20, 0, Math.PI * 2);
            ctx.fill();
        } else if (shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(25, 5);
            ctx.lineTo(45, 45);
            ctx.lineTo(5, 45);
            ctx.closePath();
            ctx.fill();
        }
        shapeCanvases[shape] = canvas;
    } catch (e) {
        console.error(`Error in createShapeCanvas: ${e.message}`);
    }
}
