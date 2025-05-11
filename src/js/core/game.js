import { GRID_WIDTH, GRID_HEIGHT, ALL_SHAPES, ALL_COLORS, PREDEFINED_TASKS } from '../constants.js';
import { validateBoard, initBoard, resolveInitialMatches, checkMatches, handleMatches, dropTiles, fillBoard, handleBonusTileAction, handleBonusStarSwap, swapTiles } from './board.js';
import { handleClick, handleDoubleClick, handleTouchStart, handleTouchMove, handleTouchEnd, isAdjacent } from './input.js';
import { render, updateAnimations, createShapeCanvas } from './render.js';
import { loadTask, generateNewTask, updateTaskDisplay, checkTaskCompletion, showNotification } from './tasks.js';

let isGameInitialized = false;
let isProcessing = false;
let selectedTile = null;
let score = 0;
let taskScore = 0;
let task = { shape: 'square', count: 10 };
let collectedShapes = { square: 0 };
let movesLeft = 15;
let currentTaskIndex = 0;
let board = [];
let animations = [];
let shapeCanvases = {};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let TILE_SIZE = 50;

function adjustCanvasSize() {
    const containerWidth = document.getElementById('game-container').offsetWidth;
    const maxCanvasWidth = Math.min(containerWidth - 20, 360);
    TILE_SIZE = Math.floor(maxCanvasWidth / GRID_WIDTH);
    canvas.width = GRID_WIDTH * TILE_SIZE;
    canvas.height = GRID_HEIGHT * TILE_SIZE;
    if (board.length === GRID_HEIGHT) {
        updateBoardPositions();
    }
    render(ctx, board, selectedTile, animations, shapeCanvases, TILE_SIZE);
}

function updateBoardPositions() {
    try {
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                if (board[row][col]) {
                    board[row][col].x = col * TILE_SIZE;
                    board[row][col].y = row * TILE_SIZE;
                    board[row][col].targetX = col * TILE_SIZE;
                    board[row][col].targetY = row * TILE_SIZE;
                }
            }
        }
    } catch (e) {
        console.error(`Error in updateBoardPositions: ${e.message}`);
    }
}

export function initGame() {
    console.log('Initializing game...');
    if (isGameInitialized) {
        console.log('Game already initialized, skipping...');
        return;
    }
    isGameInitialized = true;

    try {
        score = 0;
        taskScore = 0;
        currentTaskIndex = 0;
        loadTask(task, collectedShapes, movesLeft, currentTaskIndex, PREDEFINED_TASKS, taskScore, updateTaskDisplay, updateScoreDisplay, initBoard, render);
        initBoard(board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, TILE_SIZE, resolveInitialMatches, validateBoard);
        adjustCanvasSize();

        updateTaskDisplay(task, collectedShapes, movesLeft, shapeCanvases);
        updateScoreDisplay();

        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('dblclick', handleDoubleClick);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);

        canvas.addEventListener('click', (e) => handleClick(e, board, selectedTile, isProcessing, movesLeft, handleBonusStarSwap, swapTiles, handleMatches, checkTaskCompletion, updateTaskDisplay, render));
        canvas.addEventListener('dblclick', (e) => handleDoubleClick(e, board, isProcessing, handleBonusTileAction, checkTaskCompletion, render));
        canvas.addEventListener('touchstart', (e) => handleTouchStart(e, board, selectedTile, isProcessing, TILE_SIZE, render), { passive: false });
        canvas.addEventListener('touchmove', (e) => handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => handleTouchEnd(e, board, selectedTile, isProcessing, movesLeft, handleBonusTileAction, handleBonusStarSwap, swapTiles, handleMatches, checkTaskCompletion, updateTaskDisplay, render, TILE_SIZE), { passive: false });

        window.addEventListener('resize', adjustCanvasSize);

        createShapeCanvas('square', '#ff5555', shapeCanvases);
        createShapeCanvas('circle', '#55ff55', shapeCanvases);
        createShapeCanvas('triangle', '#5555ff', shapeCanvases);

        render(ctx, board, selectedTile, animations, shapeCanvases, TILE_SIZE);
        console.log('Game initialized successfully');
    } catch (e) {
        console.error(`Failed to initialize game: ${e.message}`);
        throw e;
    }
}

function updateScoreDisplay() {
    try {
        document.getElementById('score-value').textContent = score;
        document.getElementById('task-score-value').textContent = taskScore;
    } catch (e) {
        console.error(`Failed to update score display: ${e.message}`);
    }
}
