import { GRID_WIDTH, GRID_HEIGHT, ALL_SHAPES, ALL_COLORS, PREDEFINED_TASKS } from '../constants.js';
import { validateBoard, initBoard, resolveInitialMatches, checkMatches, handleMatches, dropTiles, fillBoard, handleBonusTileAction, handleBonusStarSwap, swapTiles } from './board.js';
import { handleClick, handleDoubleClick, handleTouchStart, handleTouchMove, handleTouchEnd, isAdjacent } from './input.js';
import { render, updateAnimations, createShapeCanvas } from './render.js';
import { loadTask, generateNewTask, updateTaskDisplay, checkTaskCompletion, showNotification } from './tasks.js';

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
    tileSize: 50
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
        if (gameState.ctx) {
            render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        } else {
            console.error('Cannot render: ctx is undefined in adjustCanvasSize');
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

function updateScoreDisplay() {
    try {
        document.getElementById('score-value').textContent = gameState.score;
        document.getElementById('task-score-value').textContent = gameState.taskScore;
    } catch (e) {
        console.error(`Failed to update score display: ${e.message}`);
    }
}

export function initGame() {
    console.log('Initializing game...');
    if (gameState.isGameInitialized) {
        console.log('Game already initialized, skipping...');
        return;
    }
    gameState.isGameInitialized = true;

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

        createShapeCanvas('square', '#ff5555', gameState.shapeCanvases);
        createShapeCanvas('circle', '#55ff55', gameState.shapeCanvases);
        createShapeCanvas('triangle', '#5555ff', gameState.shapeCanvases);

        loadTask(gameState.task, gameState.collectedShapes, gameState.movesLeft, gameState.currentTaskIndex, PREDEFINED_TASKS, gameState.taskScore, updateTaskDisplay, updateScoreDisplay, () => initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard), () => render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize));

        initBoard(gameState.board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, gameState.tileSize, resolveInitialMatches, validateBoard);
        adjustCanvasSize();

        updateTaskDisplay(gameState.task, gameState.collectedShapes, gameState.movesLeft, gameState.shapeCanvases);
        updateScoreDisplay();

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

        render(gameState.ctx, gameState.board, gameState.selectedTile, gameState.animations, gameState.shapeCanvases, gameState.tileSize);
        console.log('Game initialized successfully');
    } catch (e) {
        console.error(`Failed to initialize game: ${e.message}`);
        throw e;
    }
}
