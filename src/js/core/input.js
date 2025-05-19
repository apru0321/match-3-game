import { GRID_WIDTH, GRID_HEIGHT } from '../constants.js';
import { updateTaskDisplay } from './tasks.js';

export function handleClick(e, gameState) {
    if (gameState.isProcessing || gameState.board.length !== GRID_HEIGHT) return;
    try {
        const rect = gameState.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / gameState.tileSize);
        const row = Math.floor(y / gameState.tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        if (!gameState.selectedTile) {
            gameState.selectedTile = { row, col };
            gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        } else {
            if (isAdjacent(gameState.selectedTile, { row, col })) {
                gameState.isProcessing = true;
                gameState.movesLeft--;

                const isBonusStarSwap = gameState.board[gameState.selectedTile.row][gameState.selectedTile.col]?.bonusType === 'bonus_star' || gameState.board[row][col]?.bonusType === 'bonus_star';
                if (isBonusStarSwap) {
                    gameState.handleBonusStarSwap(
                        gameState.board,
                        gameState.selectedTile.row,
                        gameState.selectedTile.col,
                        row,
                        col,
                        ['square', 'circle', 'triangle'],
                        gameState.task,
                        gameState.collectedShapes,
                        gameState.score,
                        gameState.taskScore,
                        gameState.tileSize
                    );
                } else {
                    gameState.swapTiles(
                        gameState.board,
                        gameState.selectedTile.row,
                        gameState.selectedTile.col,
                        row,
                        col,
                        gameState.animations,
                        gameState.tileSize
                    );
                    gameState.handleMatches(
                        gameState.board,
                        ['square', 'circle', 'triangle'],
                        gameState.task,
                        gameState.collectedShapes,
                        gameState.score,
                        gameState.taskScore,
                        gameState.tileSize
                    );
                }

                gameState.checkTaskCompletion();
                updateTaskDisplay(gameState);
                gameState.selectedTile = null;
                gameState.isProcessing = false;
                gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            } else {
                gameState.selectedTile = { row, col };
                gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            }
        }
    } catch (e) {
        console.error(`Error in handleClick: ${e.message}`);
    }
}

export function handleDoubleClick(e, gameState) {
    if (gameState.isProcessing || gameState.board.length !== GRID_HEIGHT) return;
    try {
        const rect = gameState.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / gameState.tileSize);
        const row = Math.floor(y / gameState.tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        const tile = gameState.board[row][col];
        if (tile && tile.bonusType && tile.bonusType !== 'bonus_star') {
            gameState.isProcessing = true;
            gameState.handleBonusTileAction(
                gameState.board,
                row,
                col,
                tile.bonusType,
                ['square', 'circle', 'triangle'],
                gameState.task,
                gameState.collectedShapes,
                gameState.score,
                gameState.taskScore,
                gameState.tileSize
            );
            gameState.checkTaskCompletion();
            gameState.isProcessing = false;
            gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        }
    } catch (e) {
        console.error(`Error in handleDoubleClick: ${e.message}`);
    }
}

export function handleTouchStart(e, gameState) {
    if (gameState.isProcessing || gameState.board.length !== GRID_HEIGHT) return;
    try {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = gameState.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const col = Math.floor(x / gameState.tileSize);
        const row = Math.floor(y / gameState.tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        gameState.selectedTile = { row, col };
        gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
    } catch (e) {
        console.error(`Error in handleTouchStart: ${e.message}`);
    }
}

export function handleTouchMove(e) {
    e.preventDefault();
}

export function handleTouchEnd(e, gameState) {
    if (gameState.isProcessing || !gameState.selectedTile || gameState.board.length !== GRID_HEIGHT) return;
    try {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = gameState.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const col = Math.floor(x / gameState.tileSize);
        const row = Math.floor(y / gameState.tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        if (isAdjacent(gameState.selectedTile, { row, col })) {
            gameState.isProcessing = true;
            gameState.movesLeft--;

            const isBonusStarSwap = gameState.board[gameState.selectedTile.row][gameState.selectedTile.col]?.bonusType === 'bonus_star' || gameState.board[row][col]?.bonusType === 'bonus_star';
            if (isBonusStarSwap) {
                gameState.handleBonusStarSwap(
                    gameState.board,
                    gameState.selectedTile.row,
                    gameState.selectedTile.col,
                    row,
                    col,
                    ['square', 'circle', 'triangle'],
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.score,
                    gameState.taskScore,
                    gameState.tileSize
                );
            } else {
                gameState.swapTiles(
                    gameState.board,
                    gameState.selectedTile.row,
                    gameState.selectedTile.col,
                    row,
                    col,
                    gameState.animations,
                    gameState.tileSize
                );
                gameState.handleMatches(
                    gameState.board,
                    ['square', 'circle', 'triangle'],
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.score,
                    gameState.taskScore,
                    gameState.tileSize
                );
            }

            gameState.checkTaskCompletion();
            updateTaskDisplay(gameState);
            gameState.selectedTile = null;
            gameState.isProcessing = false;
            gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        }
    } catch (e) {
        console.error(`Error in handleTouchEnd: ${e.message}`);
    }
}

export function isAdjacent(tile1, tile2) {
    return (
        (tile1.row === tile2.row && Math.abs(tile1.col - tile2.col) === 1) ||
        (tile1.col === tile2.col && Math.abs(tile1.row - tile2.row) === 1)
    );
}
