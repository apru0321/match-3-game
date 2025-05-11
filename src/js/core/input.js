import { GRID_HEIGHT, GRID_WIDTH } from '../constants.js';

export function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
}

export function handleClick(event, board, selectedTile, isProcessing, movesLeft, handleBonusStarSwap, swapTiles, handleMatches, checkTaskCompletion, updateTaskDisplay, render) {
    if (isProcessing) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH || !board[row]?.[col]) return;

    if (!selectedTile) {
        selectedTile = { row, col };
        render();
    } else {
        const sr = selectedTile.row;
        const sc = selectedTile.col;
        if (isAdjacent(sr, sc, row, col)) {
            isProcessing = true;
            movesLeft--;
            updateTaskDisplay();
            const tile1 = board[sr][sc];
            const tile2 = board[row][col];
            if (tile1.bonusType === 'bonus_star' || tile2.bonusType === 'bonus_star') {
                handleBonusStarSwap(sr, sc, row, col).then(() => {
                    checkTaskCompletion();
                    isProcessing = false;
                    render();
                });
            } else {
                swapTiles(sr, sc, row, col).then(() => {
                    const matches = checkMatches();
                    if (matches) {
                        handleMatches().then(checkTaskCompletion);
                    } else {
                        swapTiles(sr, sc, row, col).then(() => {
                            isProcessing = false;
                            movesLeft++;
                            updateTaskDisplay();
                            render();
                        });
                    }
                    selectedTile = null;
                });
            }
        } else {
            selectedTile = { row, col };
            render();
        }
    }
}

export function handleDoubleClick(event, board, isProcessing, handleBonusTileAction, checkTaskCompletion, render) {
    if (isProcessing) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH || !board[row]?.[col]) return;

    const tile = board[row][col];
    if (tile.bonusType === 'horizontal_arrow' || tile.bonusType === 'vertical_arrow') {
        isProcessing = true;
        handleBonusTileAction(row, col, tile.bonusType).then(() => {
            checkTaskCompletion();
            isProcessing = false;
            render();
        });
    }
}

let touchStartTile = null;
let touchMoved = false;

export function handleTouchStart(event, board, selectedTile, isProcessing, TILE_SIZE, render) {
    if (isProcessing) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH || !board[row]?.[col]) return;

    touchStartTile = { row, col };
    touchMoved = false;
    selectedTile = { row, col };
    render();
}

export function handleTouchMove(event) {
    if (!touchStartTile) return;
    event.preventDefault();
    touchMoved = true;
}

export function handleTouchEnd(event, board, selectedTile, isProcessing, movesLeft, handleBonusTileAction, handleBonusStarSwap, swapTiles, handleMatches, checkTaskCompletion, updateTaskDisplay, render, TILE_SIZE) {
    if (!touchStartTile) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.changedTouches[0].clientX - rect.left;
    const y = event.changedTouches[0].clientY - rect.top;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (!touchMoved) {
        const tile = board[touchStartTile.row][touchStartTile.col];
        if (tile.bonusType === 'horizontal_arrow' || tile.bonusType === 'vertical_arrow') {
            isProcessing = true;
            handleBonusTileAction(touchStartTile.row, touchStartTile.col, tile.bonusType).then(() => {
                checkTaskCompletion();
                isProcessing = false;
                render();
            });
        }
    } else if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH && board[row]?.[col]) {
        const sr = touchStartTile.row;
        const sc = touchStartTile.col;
        if (isAdjacent(sr, sc, row, col)) {
            isProcessing = true;
            movesLeft--;
            updateTaskDisplay();
            const tile1 = board[sr][sc];
            const tile2 = board[row][col];
            if (tile1.bonusType === 'bonus_star' || tile2.bonusType === 'bonus_star') {
                handleBonusStarSwap(sr, sc, row, col).then(() => {
                    checkTaskCompletion();
                    isProcessing = false;
                    render();
                });
            } else {
                swapTiles(sr, sc, row, col).then(() => {
                    const matches = checkMatches();
                    if (matches) {
                        handleMatches().then(checkTaskCompletion);
                    } else {
                        swapTiles(sr, sc, row, col).then(() => {
                            isProcessing = false;
                            movesLeft++;
                            updateTaskDisplay();
                            render();
                        });
                    }
                    selectedTile = null;
                });
            }
        }
    }

    touchStartTile = null;
    selectedTile = null;
    render();
}
