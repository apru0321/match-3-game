import { ALL_SHAPES } from '../constants.js';
import { initBoard, resolveInitialMatches, validateBoard } from './board.js';

export function loadTask(gameState, PREDEFINED_TASKS) {
    try {
        if (gameState.currentTaskIndex < PREDEFINED_TASKS.length) {
            gameState.task.shape = PREDEFINED_TASKS[gameState.currentTaskIndex].shape;
            gameState.task.count = PREDEFINED_TASKS[gameState.currentTaskIndex].count;
            gameState.task.moves = PREDEFINED_TASKS[gameState.currentTaskIndex].moves;
            gameState.movesLeft = gameState.task.moves;
            gameState.collectedShapes[gameState.task.shape] = 0;
            console.log(`Loaded predefined task ${gameState.currentTaskIndex + 1}: Collect ${gameState.task.count} ${gameState.task.shape} in ${gameState.task.moves} moves`);
        } else {
            generateNewTask(gameState);
        }
        updateTaskDisplay(gameState);
        gameState.updateScoreDisplay();
    } catch (e) {
        console.error(`Failed to load task: ${e.message}`);
    }
}

export function generateNewTask(gameState) {
    try {
        gameState.task.shape = ALL_SHAPES[Math.floor(Math.random() * ALL_SHAPES.length)];
        gameState.task.count = Math.floor(Math.random() * 10) + 10;
        gameState.task.moves = Math.floor(Math.random() * 3) + 3;
        gameState.movesLeft = gameState.task.moves;
        gameState.collectedShapes[gameState.task.shape] = 0;
        console.log(`Generated new task: Collect ${gameState.task.count} ${gameState.task.shape} in ${gameState.task.moves} moves`);
    } catch (e) {
        console.error(`Failed to generate new task: ${e.message}`);
    }
}

export function updateTaskDisplay(gameState) {
    try {
        const taskDescription = document.getElementById('task-description');
        if (gameState.shapeCanvases[gameState.task.shape]) {
            taskDescription.innerHTML = `<span>Collect ${gameState.task.count} <canvas class="shape-canvas" width="20" height="20"></canvas> (${gameState.collectedShapes[gameState.task.shape] || 0}/${gameState.task.count}) in ${gameState.movesLeft} moves</span>`;
            const canvas = taskDescription.querySelector('.shape-canvas');
            const ctx = canvas.getContext('2d');
            ctx.drawImage(gameState.shapeCanvases[gameState.task.shape], 0, 0, 20, 20);
        } else {
            taskDescription.textContent = `Collect ${gameState.task.count} ${gameState.task.shape} (${gameState.collectedShapes[gameState.task.shape] || 0}/${gameState.task.count}) in ${gameState.movesLeft} moves`;
        }
    } catch (e) {
        console.error(`Failed to update task display: ${e.message}`);
    }
}

export function showNotification(message) {
    try {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 2000);
    } catch (e) {
        console.error(`Failed to show notification: ${e.message}`);
    }
}
