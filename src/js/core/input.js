import { GRID_WIDTH, GRID_HEIGHT } from '../constants.js';
import { render } from './render.js';
import { swapTiles, handleBonusStarSwap, handleMatches, handleBonusTileAction, dropTiles, fillBoard, validateBoard, checkMatches } from './board.js';
import { updateTaskDisplay, checkTaskCompletion, loadTask, showNotification } from './tasks.js';

export function handleClick(e, gameState) {
    if (gameState.isProcessing) return;
    try {
        const rect = gameState.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / gameState.tileSize);
        const row = Math.floor(y / gameState.tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        if (!gameState.selectedTile) {
            gameState.selectedTile = { row, col };
            render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        } else {
            if (isAdjacent(gameState.selectedTile, { row, col })) {
                gameState.isProcessing = true;
                gameState.movesLeft--;

                const isBonusStarSwap = gameState.board[gameState.selectedTile.row][gameState.selectedTile.col].bonusType === 'bonus_star' || gameState.board[row][col].bonusType === 'bonus_star';
                if (isBonusStarSwap) {
                    handleBonusStarSwap(
                        gameState.board,
                        gameState.selectedTile.row,
                        gameState.selectedTile.col,
                        row,
                        col,
                        GRID_HEIGHT,
                        GRID_WIDTH,
                        ['square', 'circle', 'triangle'],
                        gameState.task,
                        gameState.collectedShapes,
                        gameState.score,
                        gameState.taskScore,
                        updateScoreDisplay,
                        updateTaskDisplay,
                        (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                        dropTiles,
                        fillBoard,
                        validateBoard,
                        checkMatches,
                        handleMatches,
                        checkTaskCompletion
                    );
                } else {
                    swapTiles(
                        gameState.board,
                        gameState.selectedTile.row,
                        gameState.selectedTile.col,
                        row,
                        col,
                        gameState.animations,
                        (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                        validateBoard,
                        gameState.tileSize
                    );
                    handleMatches(
                        gameState.board,
                        ['square', 'circle', 'triangle'],
                        gameState.task,
                        gameState.collectedShapes,
                        gameState.score,
                        gameState.taskScore,
                        updateScoreDisplay,
                        updateTaskDisplay,
                        (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                        dropTiles,
                        fillBoard,
                        validateBoard,
                        checkTaskCompletion
                    );
                }

                checkTaskCompletion(
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.movesLeft,
                    gameState.currentTaskIndex,
                    gameState.taskScore,
                    updateTaskDisplay,
                    updateScoreDisplay,
                    () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ['square', 'circle', 'triangle'], gameState.tileSize, resolveInitialMatches, validateBoard),
                    (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                    loadTask,
                    showNotification,
                    gameState.ctx,
                    gameState.board,
                    gameState.selectedTile,
                    gameState.animations,
                    gameState.shapeCanvases,
                    gameState.tileSize
                );
                updateTaskDisplay(gameState.task, gameState.collectedShapes, gameState.movesLeft, gameState.shapeCanvases);
                gameState.selectedTile = null;
                gameState.isProcessing = false;
                render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            } else {
                gameState.selectedTile = { row, col };
                render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            }
        }
    } catch (e) {
        console.error(`Error in handleClick: ${e.message}`);
    }
}

export function handleDoubleClick(e, gameState) {
    if (gameState.isProcessing) return;
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
            handleBonusTileAction(
                gameState.board,
                row,
                col,
                tile.bonusType,
                GRID_HEIGHT,
                GRID_WIDTH,
                ['square', 'circle', 'triangle'],
                gameState.task,
                gameState.collectedShapes,
                gameState.score,
                gameState.taskScore,
                updateScoreDisplay,
                updateTaskDisplay,
                (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                dropTiles,
                fillBoard,
                validateBoard,
                checkMatches,
                handleMatches,
                checkTaskCompletion
            );
            checkTaskCompletion(
                gameState.task,
                gameState.collectedShapes,
                gameState.movesLeft,
                gameState.currentTaskIndex,
                gameState.taskScore,
                updateTaskDisplay,
                updateScoreDisplay,
                () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ['square', 'circle', 'triangle'], gameState.tileSize, resolveInitialMatches, validateBoard),
                (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                loadTask,
                showNotification,
                gameState.ctx,
                gameState.board,
                gameState.selectedTile,
                gameState.animations,
                gameState.shapeCanvases,
                gameState.tileSize
            );
            gameState.isProcessing = false;
            render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        }
    } catch (e) {
        console.error(`Error in handleDoubleClick: ${e.message}`);
    }
}

export function handleTouchStart(e, gameState) {
    if (gameState.isProcessing) return;
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
        render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
    } catch (e) {
        console.error(`Error in handleTouchStart: ${e.message}`);
    }
}

export function handleTouchMove(e) {
    e.preventDefault();
}

export function handleTouchEnd(e, gameState) {
    if (gameState.isProcessing || !gameState.selectedTile) return;
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

            const isBonusStarSwap = gameState.board[gameState.selectedTile.row][gameState.selectedTile.col].bonusType === 'bonus_star' || gameState.board[row][col].bonusType === 'bonus_star';
            if (isBonusStarSwap) {
                handleBonusStarSwap(
                    gameState.board,
                    gameState.selectedTile.row,
                    gameState.selectedTile.col,
                    row,
                    col,
                    GRID_HEIGHT,
                    GRID_WIDTH,
                    ['square', 'circle', 'triangle'],
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.score,
                    gameState.taskScore,
                    updateScoreDisplay,
                    updateTaskDisplay,
                    (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                    dropTiles,
                    fillBoard,
                    validateBoard,
                    checkMatches,
                    handleMatches,
                    checkTaskCompletion
                );
            } else {
                swapTiles(
                    gameState.board,
                    gameState.selectedTile.row,
                    gameState.selectedTile.col,
                    row,
                    col,
                    gameState.animations,
                    (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                    validateBoard,
                    gameState.tileSize
                );
                handleMatches(
                    gameState.board,
                    ['square', 'circle', 'triangle'],
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.score,
                    gameState.taskScore,
                    updateScoreDisplay,
                    updateTaskDisplay,
                    (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                    dropTiles,
                    fillBoard,
                    validateBoard,
                    checkTaskCompletion
                );
            }

            checkTaskCompletion(
                gameState.task,
                gameState.collectedShapes,
                gameState.movesLeft,
                gameState.currentTaskIndex,
                gameState.taskScore,
                updateTaskDisplay,
                updateScoreDisplay,
                () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ['square', 'circle', 'triangle'], gameState.tileSize, resolveInitialMatches, validateBoard),
                (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => render(ctx, board, selectedTile, animations, shapeCanvases, tileSize),
                loadTask,
                showNotification,
                gameState.ctx,
                gameState.board,
                gameState.selectedTile,
                gameState.animations,
                gameState.shapeCanvases,
                gameState.tileSize
            );
            updateTaskDisplay(gameState.task, gameState.collectedShapes, gameState.movesLeft, gameState.shapeCanvases);
            gameState.selectedTile = null;
            gameState.isProcessing = false;
            render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
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

function updateScoreDisplay() {
    try {
        document.getElementById('score-value').textContent = gameState.score;
        document.getElementById('task-score-value').textContent = gameState.taskScore;
    } catch (e) {
        console.error(`Failed to update score display: ${e.message}`);
    }
}
