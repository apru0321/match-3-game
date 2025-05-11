import { initBoard } from './board.js';

export function loadTask(task, collectedShapes, movesLeft, currentTaskIndex, PREDEFINED_TASKS, taskScore, updateTaskDisplay, updateScoreDisplay, initBoard, render) {
    try {
        console.log(`Loading task at index ${currentTaskIndex}`);
        if (currentTaskIndex < PREDEFINED_TASKS.length) {
            task = PREDEFINED_TASKS[currentTaskIndex];
            movesLeft = task.moves;
            console.log(`Loaded predefined task ${currentTaskIndex + 1}: Collect ${task.count} ${task.shape} in ${movesLeft} moves`);
        } else {
            generateNewTask(task, collectedShapes, movesLeft, taskScore, updateTaskDisplay, updateScoreDisplay, initBoard, render);
        }
        collectedShapes = { [task.shape]: 0 };
        taskScore = 0;
        updateTaskDisplay(task, collectedShapes, movesLeft);
        updateScoreDisplay();
    } catch (e) {
        console.error(`Failed to load task: ${e.message}`);
    }
}

export function generateNewTask(task, collectedShapes, movesLeft, taskScore, updateTaskDisplay, updateScoreDisplay, initBoard, render) {
    try {
        const shapes = ['square', 'circle', 'triangle'];
        task = {
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            count: Math.floor(Math.random() * 8) + 8
        };
        collectedShapes = { [task.shape]: 0 };
        movesLeft = Math.floor(Math.random() * 9) + 12;
        taskScore = 0;
        console.log(`New random task: Collect ${task.count} ${task.shape} in ${movesLeft} moves`);
        initBoard();
        updateTaskDisplay(task, collectedShapes, movesLeft);
        updateScoreDisplay();
        render();
    } catch (e) {
        console.error(`Failed to generate new task: ${e.message}`);
    }
}

export function updateTaskDisplay(task, collectedShapes, movesLeft, shapeCanvases) {
    try {
        let html = `Collect ${collectedShapes[task.shape]}/${task.count} `;
        html += '<canvas width="18" height="18"></canvas>';
        html += ` in ${movesLeft} moves`;
        document.getElementById('task-description').innerHTML = html;
        const canvas = document.getElementById('task-description').querySelector('canvas');
        canvas.getContext('2d').drawImage(shapeCanvases[task.shape], 0, 0);
    } catch (e) {
        console.error(`Failed to update task display: ${e.message}`);
    }
}

export function showNotification(message) {
    try {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hidden');
        }, 2000);
    } catch (e) {
        console.error(`Failed to show notification: ${e.message}`);
    }
}

let isTaskProcessing = false;

export function checkTaskCompletion(task, collectedShapes, movesLeft, score, taskScore, currentTaskIndex, updateScoreDisplay, updateTaskDisplay, showNotification, loadTask, initBoard, render) {
    try {
        if (isTaskProcessing) {
            console.log('checkTaskCompletion: Task processing in progress, skipping...');
            return;
        }
        isTaskProcessing = true;

        if (collectedShapes[task.shape] >= task.count) {
            console.log(`Task completed: Collected ${collectedShapes[task.shape]}/${task.count} ${task.shape}`);
            score += taskScore;
            taskScore = 0;
            updateScoreDisplay();
            showNotification('Task Completed!');
            setTimeout(() => {
                currentTaskIndex++;
                loadTask();
                initBoard();
                updateTaskDisplay(task, collectedShapes, movesLeft);
                updateScoreDisplay();
                render();
                isTaskProcessing = false;
            }, 2000);
        } else if (movesLeft <= 0) {
            console.log(`Task failed: Ran out of moves. Collected ${collectedShapes[task.shape]}/${task.count} ${task.shape}`);
            taskScore = 0;
            updateScoreDisplay();
            showNotification('Task Failed! Try Again.');
            setTimeout(() => {
                loadTask();
                initBoard();
                updateTaskDisplay(task, collectedShapes, movesLeft);
                updateScoreDisplay();
                render();
                isTaskProcessing = false;
            }, 2000);
        } else {
            isTaskProcessing = false;
        }
    } catch (e) {
        console.error(`Failed to check task completion: ${e.message}`);
        isTaskProcessing = false;
    }
}
