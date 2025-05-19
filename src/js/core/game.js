import { GRID_WIDTH, GRID_HEIGHT, ALL_SHAPES, ALL_COLORS, PREDEFINED_TASKS } from '../constants.js';
import { validateBoard, initBoard, resolveInitialMatches, checkMatches, dropTiles, fillBoard } from './board.js';
import { handleClick, handleDoubleClick, handleTouchStart, handleTouchMove, handleTouchEnd } from './input.js';
import { render, updateAnimations, createShapeCanvas } from './render.js';
import { loadTask, updateTaskDisplay, checkTaskCompletion, showNotification } from './tasks.js';

const gameState = {
    isGameInitialized: false,
    isProcessing: false,
    selectedTile: null,
    score: 0,
    taskScore: 0,
    task: { shape: 'square', count: 10, moves: 3 },
    collectedShapes: { square: 0, circle: 0, triangle: 0 },
    movesLeft: 3,
    currentTaskIndex: 0,
    board: [],
    animations: [],
    shapeCanvases: {},
    canvas: document.getElementById('game-canvas'),
    ctx: null,
    tileSize: 50,
    // Методы
    render: (ctx, board, selectedTile, animations, shapeCanvases, tileSize) => {
        try {
            if (!ctx) throw new Error('ctx is undefined');
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
    },
    updateScoreDisplay: () => {
        try {
            document.getElementById('score-value').textContent = gameState.score;
            document.getElementById('task-score-value').textContent = gameState.taskScore;
        } catch (e) {
            console.error(`Failed to update score display: ${e.message}`);
        }
    },
    swapTiles: (board, row1, col1, row2, col2, animations, tileSize) => {
        try {
            const temp = board[row1][col1];
            board[row1][col1] = board[row2][col2];
            board[row2][col2] = temp;

            board[row1][col1].targetX = col1 * tileSize;
            board[row1][col1].targetY = row1 * tileSize;
            board[row2][col2].targetX = col2 * tileSize;
            board[row2][col2].targetY = row2 * tileSize;

            gameState.render(gameState.ctx, board, null, animations, gameState.shapeCanvases, tileSize);
        } catch (e) {
            console.error(`Failed to swap tiles: ${e.message}`);
        }
    },
    handleMatches: (board, ALL_SHAPES, task, collectedShapes, score, taskScore, tileSize) => {
        try {
            const matches = checkMatches(board, GRID_HEIGHT, GRID_WIDTH);
            if (matches.length > 0) {
                matches.forEach(match => {
                    if (match.type === 'Horizontal') {
                        for (let col = match.col; col < match.col + match.length; col++) {
                            board[match.row][col].disappearing = true;
                            collectedShapes[ALL_SHAPES[board[match.row][col].type]] = (collectedShapes[ALL_SHAPES[board[match.row][col].type]] || 0) + 1;
                        }
                    } else if (match.type === 'Vertical') {
                        for (let row = match.row; row < match.row + match.length; row++) {
                            board[row][match.col].disappearing = true;
                            collectedShapes[ALL_SHAPES[board[row][match.col].type]] = (collectedShapes[ALL_SHAPES[board[row][col].type]] || 0) + 1;
                        }
                    } else if (match.type === 'L-shaped') {
                        for (let r = match.row; r < match.row + 3; r++) {
                            board[r][match.col].disappearing = true;
                            collectedShapes[ALL_SHAPES[board[r][match.col].type]] = (collectedShapes[ALL_SHAPES[board[r][match.col].type]] || 0) + 1;
                        }
                        for (let c = match.col; c < match.col + 3; c++) {
                            board[match.row][c].disappearing = true;
                            collectedShapes[ALL_SHAPES[board[match.row][c].type]] = (collectedShapes[ALL_SHAPES[board[match.row][c].type]] || 0) + 1;
                        }
                    }
                    score += match.length * 10;
                });

                dropTiles(board, gameState.animations, gameState.render, validateBoard, gameState.ctx, gameState.shapeCanvases, tileSize);
                fillBoard(board, ALL_SHAPES, gameState.animations, gameState.render, validateBoard, gameState.ctx, gameState.shapeCanvases, tileSize);
                gameState.updateScoreDisplay();
                updateTaskDisplay(task, collectedShapes, gameState.movesLeft);
                gameState.checkTaskCompletion();
            }
        } catch (e) {
            console.error(`Failed to handle matches: ${e.message}`);
        }
    },
    handleBonusStarSwap: (board, row1, col1, row2, col2, ALL_SHAPES, task, collectedShapes, score, taskScore, tileSize) => {
        try {
            board[row1][col1].disappearing = true;
            board[row2][col2].disappearing = true;
            collectedShapes[ALL_SHAPES[board[row1][col1].type]] = (collectedShapes[ALL_SHAPES[board[row1][col1].type]] || 0) + 1;
            collectedShapes[ALL_SHAPES[board[row2][col2].type]] = (collectedShapes[ALL_SHAPES[board[row2][col2].type]] || 0) + 1;
            score += 100;
            dropTiles(board, gameState.animations, gameState.render, validateBoard, gameState.ctx, gameState.shapeCanvases, tileSize);
            fillBoard(board, ALL_SHAPES, gameState.animations, gameState.render, validateBoard, gameState.ctx, gameState.shapeCanvases, tileSize);
            gameState.updateScoreDisplay();
            updateTaskDisplay(task, collectedShapes, gameState.movesLeft);
            gameState.checkTaskCompletion();
        } catch (e) {
            console.error(`Failed to handle bonus star swap: ${e.message}`);
        }
    },
    handleBonusTileAction: (board, row, col, bonusType, ALL_SHAPES, task, collectedShapes, score, taskScore, tileSize) => {
        try {
            board[row][col].disappearing = true;
            collectedShapes[ALL_SHAPES[board[row][col].type]] = (collectedShapes[ALL_SHAPES[board[row][col].type]] || 0) + 1;
            score += 50;
            dropTiles(board, gameState.animations, gameState.render, validateBoard, gameState.ctx, gameState.shapeCanvases, tileSize);
            fillBoard(board, ALL_SHAPES, gameState.animations, gameState.render, validateBoard, gameState.ctx, gameState.shapeCanvases, tileSize);
            gameState.updateScoreDisplay();
            updateTaskDisplay(task, collectedShapes, gameState.movesLeft);
            gameState.checkTaskCompletion();
        } catch (e) {
            console.error(`Failed to handle bonus tile action: ${e.message}`);
        }
    },
    checkTaskCompletion: () => {
        try {
            if (gameState.collectedShapes[gameState.task.shape] >= gameState.task.count) {
                gameState.taskScore += 100;
                gameState.currentTaskIndex++;
                showNotification('Task Completed!');
                loadTask(
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.movesLeft,
                    gameState.currentTaskIndex,
                    PREDEFINED_TASKS,
                    gameState.taskScore,
                    updateTaskDisplay,
                    gameState.updateScoreDisplay,
                    () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard),
                    gameState.render
                );
                gameState.updateScoreDisplay();
                initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard);
                gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            } else if (gameState.movesLeft <= 0) {
                showNotification('Task Failed! Restarting...');
                loadTask(
                    gameState.task,
                    gameState.collectedShapes,
                    gameState.movesLeft,
                    gameState.currentTaskIndex,
                    PREDEFINED_TASKS,
                    gameState.taskScore,
                    updateTaskDisplay,
                    gameState.updateScoreDisplay,
                    () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard),
                    gameState.render
                );
                gameState.updateScoreDisplay();
                initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard);
                gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            }
        } catch (e) {
            console.error(`Failed to check task completion: ${e.message}`);
        }
    }
};

function adjustCanvasSize() {
    try {
        const containerWidth = document.getElementById('game-container').offsetWidth;
        gameState.tileSize = Math.floor(Math.min(containerWidth - 20, 360) / GRID_WIDTH);
        gameState.canvas.width = GRID_WIDTH * gameState.tileSize;
        gameState.canvas.height = GRID_HEIGHT * gameState.tileSize;
        if (gameState.board.length === GRID_HEIGHT) {
            updateBoardPositions();
        }
        if (gameState.ctx && gameState.board.length === GRID_HEIGHT) {
            gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        } else {
            console.warn('Cannot render: ctx or board not fully initialized');
        }
    } catch (e) {
        console.error(`Error in adjustCanvasSize: ${e.message}`);
    }
}

function updateBoardPositions() {
    try {
        validateBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH);
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                if (gameState.board[row][col]) {
                    gameState.board[row][col].x = col * gameState.tileSize;
                    gameState.board[row][col].y = row * gameState.tileSize;
                    gameState.board[row][col].targetX = col * gameState.tileSize;
                    gameState.board[row][col].targetY = row * gameState.tileSize;
                }
            }
        }
    } catch (e) {
        console.error(`Error in updateBoardPositions: ${e.message}`);
    }
}

export function initGame() {
    console.log('Initializing game...');
    if (gameState.isGameInitialized) {
        console.log('Game already initialized, skipping...');
        return;
    }

    try {
        if (!gameState.canvas) {
            throw new Error('Canvas element not found');
        }
        gameState.ctx = gameState.canvas.getContext('2d');
        if (!gameState.ctx) {
            throw new Error('Failed to get 2D context for canvas');
        }

        gameState.score = 0;
        gameState.taskScore = 0;
        gameState.currentTaskIndex = 0;
        gameState.isGameInitialized = true;

        createShapeCanvas('square', '#ff5555', gameState.shapeCanvases);
        createShapeCanvas('circle', '#55ff55', gameState.shapeCanvases);
        createShapeCanvas('triangle', '#5555ff', gameState.shapeCanvases);

        loadTask(
            gameState.task,
            gameState.collectedShapes,
            gameState.movesLeft,
            gameState.currentTaskIndex,
            PREDEFINED_TASKS,
            gameState.taskScore,
            updateTaskDisplay,
            gameState.updateScoreDisplay,
            () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard),
            gameState.render
        );

        initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard);
        adjustCanvasSize();

        updateTaskDisplay(gameState.task, gameState.collectedShapes, gameState.movesLeft, gameState.shapeCanvases);
        gameState.updateScoreDisplay();

        gameState.canvas.removeEventListener('click', handleClick);
        gameState.canvas.removeEventListener('dblclick', handleDoubleClick);
        gameState.canvas.removeEventListener('touchstart', handleTouchStart);
        gameState.canvas.removeEventListener('touchmove', handleTouchMove);
        gameState.canvas.removeEventListener('touchend', handleTouchEnd);

        gameState.canvas.addEventListener('click', (e) => handleClick(e, gameState));
        gameState.canvas.addEventListener('dblclick', (e) => handleDoubleClick(e, gameState));
        gameState.canvas.addEventListener('touchstart', (e) => handleTouchStart(e, gameState), { passive: false });
        gameState.canvas.addEventListener('touchmove', (e) => handleTouchMove(e), { passive: false });
        gameState.canvas.addEventListener('touchend', (e) => handleTouchEnd(e, gameState), { passive: false });

        window.addEventListener('resize', adjustCanvasSize);

        if (gameState.board.length === GRID_HEIGHT) {
            gameState.render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
            console.log('Game initialized successfully');
        } else {
            throw new Error('Board initialization failed, cannot render');
        }
    } catch (e) {
        console.error(`Failed to initialize game: ${e.message}`);
        gameState.isGameInitialized = false;
        throw e;
    }
}
