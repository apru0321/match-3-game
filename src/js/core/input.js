import { GRID_WIDTH, GRID_HEIGHT } from '../constants.js';

export function handleClick(e, board, selectedTile, isProcessing, movesLeft, handleBonusStarSwap, swapTiles, handleMatches, checkTaskCompletion, updateTaskDisplay, render, score, taskScore, updateScoreDisplay, canvas, tileSize) {
    if (isProcessing) return;
    try {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        if (!selectedTile) {
            selectedTile = { row, col };
            render();
        } else {
            if (isAdjacent(selectedTile, { row, col })) {
                isProcessing = true;
                movesLeft--;

                const isBonusStarSwap = board[selectedTile.row][selectedTile.col].bonusType === 'bonus_star' || board[row][col].bonusType === 'bonus_star';
                if (isBonusStarSwap) {
                    handleBonusStarSwap(board, selectedTile.row, selectedTile.col, row, col, GRID_HEIGHT, GRID_WIDTH, ['square', 'circle', 'triangle'], task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches, checkTaskCompletion);
                } else {
                    swapTiles(board, selectedTile.row, selectedTile.col, row, col, [], render, validateBoard, tileSize);
                    handleMatches(board, ['square', 'circle', 'triangle'], task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkTaskCompletion);
                }

                checkTaskCompletion();
                updateTaskDisplay(task, collectedShapes, movesLeft);
                selectedTile = null;
                isProcessing = false;
                render();
            } else {
                selectedTile = { row, col };
                render();
            }
        }
    } catch (e) {
        console.error(`Error in handleClick: ${e.message}`);
    }
}

export function handleDoubleClick(e, board, isProcessing, handleBonusTileAction, checkTaskCompletion, render, canvas, tileSize) {
    if (isProcessing) return;
    try {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        const tile = board[row][col];
        if (tile && tile.bonusType && tile.bonusType !== 'bonus_star') {
            isProcessing = true;
            handleBonusTileAction(board, row, col, tile.bonusType, GRID_HEIGHT, GRID_WIDTH, ['square', 'circle', 'triangle'], task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches, checkTaskCompletion);
            checkTaskCompletion();
            isProcessing = false;
            render();
        }
    } catch (e) {
        console.error(`Error in handleDoubleClick: ${e.message}`);
    }
}

export function handleTouchStart(e, board, selectedTile, isProcessing, tileSize, render, canvas) {
    if (isProcessing) return;
    try {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        selectedTile = { row, col };
        render();
    } catch (e) {
        console.error(`Error in handleTouchStart: ${e.message}`);
    }
}

export function handleTouchMove(e) {
    e.preventDefault();
}

export function handleTouchEnd(e, board, selectedTile, isProcessing, movesLeft, handleBonusTileAction, handleBonusStarSwap, swapTiles, handleMatches, checkTaskCompletion, updateTaskDisplay, render, tileSize, canvas) {
    if (isProcessing || !selectedTile) return;
    try {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) return;

        if (isAdjacent(selectedTile, { row, col })) {
            isProcessing = true;
            movesLeft--;

            const isBonusStarSwap = board[selectedTile.row][selectedTile.col].bonusType === 'bonus_star' || board[row][col].bonusType === 'bonus_star';
            if (isBonusStarSwap) {
                handleBonusStarSwap(board, selectedTile.row, selectedTile.col, row, col, GRID_HEIGHT, GRID_WIDTH, ['square', 'circle', 'triangle'], task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches, checkTaskCompletion);
            } else {
                swapTiles(board, selectedTile.row, selectedTile.col, row, col, [], render, validateBoard, tileSize);
                handleMatches(board, ['square', 'circle', 'triangle'], task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkTaskCompletion);
            }

            checkTaskCompletion();
            updateTaskDisplay(task, collectedShapes, movesLeft);
            selectedTile = null;
            isProcessing = false;
            render();
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
