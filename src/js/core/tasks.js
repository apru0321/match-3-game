import { ALL_SHAPES } from '../constants.js';
import { initBoard, resolveInitialMatches, validateBoard } from './board.js';
import { render } from './render.js';

export function loadTask(task, collectedShapes, movesLeftRef, currentTaskIndex, PREDEFINED_TASKS, taskScore, updateTaskDisplay, updateScoreDisplay, initBoardCallback, renderCallback) {
    try {
        if (currentTaskIndex < PREDEFINED_TASKS.length) {
            task.shape = PREDEFINED_TASKS[currentTaskIndex].shape;
            task.count = PREDEFINED_TASKS[currentTaskIndex].count;
            task.moves = PREDEFINED_TASKS[currentTaskIndex].moves;
            movesLeftRef.value = task.moves; // Используем movesLeft как объект для мутации
            collectedShapes[task.shape] = 0;
            console.log(`Loaded predefined task ${currentTaskIndex + 1}: Collect ${task.count} ${task.shape} in ${task.moves} moves`);
        } else {
            generateNewTask(task, collectedShapes, movesLeftRef);
        }
        updateTaskDisplay(task, collectedShapes, movesLeftRef.value, {});
        updateScoreDisplay();
    } catch (e) {
        console.error(`Failed to load task: ${e.message}`);
    }
}

export function generateNewTask(task, collectedShapes, movesLeftRef) {
    try {
        task.shape = ALL_SHAPES[Math.floor(Math.random() * ALL_SHAPES.length)];
        task.count = Math.floor(Math.random() * 10) + 10;
        task.moves = Math.floor(Math.random() * 3) + 3;
        movesLeftRef.value = task.moves;
        collectedShapes[task.shape] = 0;
        console.log(`Generated new task: Collect ${task.count} ${task.shape} in ${task.moves} moves`);
    } catch (e) {
        console.error(`Failed to generate new task: ${e.message}`);
    }
}

export function updateTaskDisplay(task, collectedShapes, movesLeft, shapeCanvases = {}) {
    try {
        const taskDescription = document.getElementById('task-description');
        if (shapeCanvases[task.shape]) {
            taskDescription.innerHTML = `<span>Collect ${task.count} <canvas class="shape-canvas" width="20" height="20"></canvas> (${collectedShapes[task.shape] || 0}/${task.count}) in ${movesLeft} moves</span>`;
            const canvas = taskDescription.querySelector('.shape-canvas');
            const ctx = canvas.getContext('2d');
            ctx.drawImage(shapeCanvases[task.shape], 0, 0, 20, 20);
        } else {
            taskDescription.textContent = `Collect ${task.count} ${task.shape} (${collectedShapes[task.shape] || 0}/${task.count}) in ${movesLeft} moves`;
        }
    } catch (e) {
        console.error(`Failed to update task display: ${e.message}`);
    }
}

export function checkTaskCompletion(task, collectedShapes, movesLeftRef, currentTaskIndexRef, taskScoreRef, updateTaskDisplay, updateScoreDisplay, initBoardCallback, renderCallback, loadTaskCallback, showNotification, ctx, board, selectedTile, animations, shapeCanvases, tileSize) {
    try {
        if (collectedShapes[task.shape] >= task.count) {
            taskScoreRef.value += 100;
            currentTaskIndexRef.value++;
            showNotification('Task Completed!');
            loadTaskCallback(task, collectedShapes, movesLeftRef, currentTaskIndexRef.value, PREDEFINED_TASKS, taskScoreRef.value, updateTaskDisplay, updateScoreDisplay, initBoardCallback, renderCallback);
            updateScoreDisplay();
            initBoardCallback();
            renderCallback(ctx, board, selectedTile, animations, shapeCanvases, tileSize);
        } else if (movesLeftRef.value <= 0) {
            showNotification('Task Failed! Restarting...');
            loadTaskCallback(task, collectedShapes, movesLeftRef, currentTaskIndexRef.value, PREDEFINED_TASKS, taskScoreRef.value, updateTaskDisplay, updateScoreDisplay, initBoardCallback, renderCallback);
            updateScoreDisplay();
            initBoardCallback();
            renderCallback(ctx, board, selectedTile, animations, shapeCanvases, tileSize);
        }
    } catch (e) {
        console.error(`Failed to check task completion: ${e.message}`);
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
