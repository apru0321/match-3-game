import { GRID_WIDTH, GRID_HEIGHT, ALL_SHAPES } from '../constants.js';

export function initBoard(board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, tileSize, resolveInitialMatches, validateBoard) {
    console.log('Initializing board...');
    console.log(`GRID_WIDTH === ${GRID_WIDTH}`);
    console.log(`GRID_HEIGHT === ${GRID_HEIGHT}`);
    try {
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
        board.length = 0;
        for (let row = 0; row < GRID_HEIGHT; row++) {
            const rowArray = [];
            for (let col = 0; col < GRID_WIDTH; col++) {
                const tile = {
                    type: Math.floor(Math.random() * ALL_SHAPES.length),
                    x: col * tileSize,
                    y: row * tileSize,
                    targetX: col * tileSize,
                    targetY: row * tileSize,
                    bonusType: null,
                    disappearing: false,
                    disappearProgress: 0
                };
                rowArray.push(tile);
            }
            board.push(rowArray);
        }
        console.log(`Str ${GRID_WIDTH * GRID_HEIGHT} board...`);
        resolveInitialMatches(board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, [], validateBoard);
        console.log('Board initialized successfully');
        console.log(`GRID_WIDTH === ${GRID_WIDTH}`);
        console.log(`GRID_HEIGHT === ${GRID_HEIGHT}`);
    } catch (e) {
        console.error(`Failed to initialize board: ${e.message}`);
    }
}

export function validateBoard(board, GRID_HEIGHT, GRID_WIDTH) {
    try {
        if (!board) throw new Error('Board is undefined');
        if (board.length !== GRID_HEIGHT) throw new Error(`Board height must be ${GRID_HEIGHT}`);
        for (let row = 0; row < GRID_HEIGHT; row++) {
            if (!board[row] || board[row].length !== GRID_WIDTH) {
                throw new Error(`Board row ${row} must have width ${GRID_WIDTH}`);
            }
        }
    } catch (e) {
        console.error(`Board validation failed: ${e.message}`);
        throw e;
    }
}

export function resolveInitialMatches(board, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, animations, validateBoard) {
    console.log('Resolving initial matches...');
    try {
        let iteration = 0;
        while (true) {
            const matches = checkMatches(board, GRID_HEIGHT, GRID_WIDTH);
            if (matches.length === 0) break;
            console.log(`Checking matches...`);
            matches.forEach(match => {
                console.log(`${match.type} match at ${match.position}: ${match.length} ${ALL_SHAPES[board[match.row][match.col].type]} tiles`);
            });
            handleMatches(board, ALL_SHAPES, {}, {}, {}, {}, () => {}, () => {}, () => {}, dropTiles, fillBoard, validateBoard, () => {});
            iteration++;
            console.log(`GRID_WIDTH === ${GRID_WIDTH}`);
            console.log(`GRID_HEIGHT === ${GRID_HEIGHT}`);
        }
        console.log(`Initial matches resolved after ${iteration} iterations`);
    } catch (e) {
        console.error(`Failed to resolve initial matches: ${e.message}`);
    }
}

export function checkMatches(board, GRID_HEIGHT, GRID_WIDTH) {
    const matches = [];
    try {
        // Horizontal matches
        for (let row = 0; row < GRID_HEIGHT; row++) {
            let count = 1;
            let startCol = 0;
            for (let col = 1; col < GRID_WIDTH; col++) {
                if (board[row][col] && board[row][col - 1] && board[row][col].type === board[row][col - 1].type) {
                    count++;
                } else {
                    if (count >= 3) {
                        matches.push({
                            type: 'Horizontal',
                            row,
                            col: startCol,
                            length: count,
                            position: `row ${row}`
                        });
                    }
                    count = 1;
                    startCol = col;
                }
            }
            if (count >= 3) {
                matches.push({
                    type: 'Horizontal',
                    row,
                    col: startCol,
                    length: count,
                    position: `row ${row}`
                });
            }
        }

        // Vertical matches
        for (let col = 0; col < GRID_WIDTH; col++) {
            let count = 1;
            let startRow = 0;
            for (let row = 1; row < GRID_HEIGHT; row++) {
                if (board[row][col] && board[row - 1][col] && board[row][col].type === board[row - 1][col].type) {
                    count++;
                } else {
                    if (count >= 3) {
                        matches.push({
                            type: 'Vertical',
                            row: startRow,
                            col,
                            length: count,
                            position: `col ${col}`
                        });
                    }
                    count = 1;
                    startRow = row;
                }
            }
            if (count >= 3) {
                matches.push({
                    type: 'Vertical',
                    row: startRow,
                    col,
                    length: count,
                    position: `col ${col}`
                });
            }
        }

        // L-shaped matches (simplified example)
        for (let row = 0; row < GRID_HEIGHT - 2; row++) {
            for (let col = 0; col < GRID_WIDTH - 2; col++) {
                if (board[row][col] && board[row + 1][col] && board[row + 2][col] && board[row][col + 1] && board[row][col + 2] &&
                    board[row][col].type === board[row + 1][col].type &&
                    board[row][col].type === board[row + 2][col].type &&
                    board[row][col].type === board[row][col + 1].type &&
                    board[row][col].type === board[row][col + 2].type) {
                    matches.push({
                        type: 'L-shaped',
                        row,
                        col,
                        length: 5,
                        position: `(${row}, ${col})`
                    });
                }
            }
        }

        return matches;
    } catch (e) {
        console.error(`Failed to check matches: ${e.message}`);
        return [];
    }
}

export function handleMatches(board, ALL_SHAPES, task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, renderCallback, dropTiles, fillBoard, validateBoard, checkTaskCompletion, ctx, animations, shapeCanvases, tileSize) {
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
                        collectedShapes[ALL_SHAPES[board[row][match.col].type]] = (collectedShapes[ALL_SHAPES[board[row][match.col].type]] || 0) + 1;
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

            dropTiles(board, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize);
            fillBoard(board, ALL_SHAPES, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize);
            updateScoreDisplay();
            updateTaskDisplay(task, collectedShapes, movesLeft);
            checkTaskCompletion();
        }
    } catch (e) {
        console.error(`Failed to handle matches: ${e.message}`);
    }
}

export function dropTiles(board, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize) {
    try {
        for (let col = 0; col < GRID_WIDTH; col++) {
            let emptyRow = GRID_HEIGHT - 1;
            for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
                if (!board[row][col].disappearing) {
                    board[emptyRow][col] = board[row][col];
                    board[emptyRow][col].targetY = emptyRow * tileSize;
                    emptyRow--;
                }
            }
            for (let row = emptyRow; row >= 0; row--) {
                board[row][col] = null;
            }
        }
        renderCallback(ctx, board, null, animations, shapeCanvases, tileSize);
    } catch (e) {
        console.error(`Failed to drop tiles: ${e.message}`);
    }
}

export function fillBoard(board, ALL_SHAPES, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize) {
    try {
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                if (!board[row][col]) {
                    board[row][col] = {
                        type: Math.floor(Math.random() * ALL_SHAPES.length),
                        x: col * tileSize,
                        y: row * tileSize,
                        targetX: col * tileSize,
                        targetY: row * tileSize,
                        bonusType: null,
                        disappearing: false,
                        disappearProgress: 0
                    };
                }
            }
        }
        renderCallback(ctx, board, null, animations, shapeCanvases, tileSize);
    } catch (e) {
        console.error(`Failed to fill board: ${e.message}`);
    }
}

export function swapTiles(board, row1, col1, row2, col2, animations, renderCallback, validateBoard, tileSize, ctx, shapeCanvases) {
    try {
        const temp = board[row1][col1];
        board[row1][col1] = board[row2][col2];
        board[row2][col2] = temp;

        board[row1][col1].targetX = col1 * tileSize;
        board[row1][col1].targetY = row1 * tileSize;
        board[row2][col2].targetX = col2 * tileSize;
        board[row2][col2].targetY = row2 * tileSize;

        renderCallback(ctx, board, null, animations, shapeCanvases, tileSize);
    } catch (e) {
        console.error(`Failed to swap tiles: ${e.message}`);
    }
}

export function handleBonusTileAction(board, row, col, bonusType, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, renderCallback, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches, checkTaskCompletion, ctx, animations, shapeCanvases, tileSize) {
    try {
        board[row][col].disappearing = true;
        collectedShapes[ALL_SHAPES[board[row][col].type]] = (collectedShapes[ALL_SHAPES[board[row][col].type]] || 0) + 1;
        score += 50;
        dropTiles(board, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize);
        fillBoard(board, ALL_SHAPES, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize);
        updateScoreDisplay();
        updateTaskDisplay(task, collectedShapes, movesLeft);
        checkTaskCompletion();
    } catch (e) {
        console.error(`Failed to handle bonus tile action: ${e.message}`);
    }
}

export function handleBonusStarSwap(board, row1, col1, row2, col2, GRID_HEIGHT, GRID_WIDTH, ALL_SHAPES, task, collectedShapes, score, taskScore, updateScoreDisplay, updateTaskDisplay, renderCallback, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches, checkTaskCompletion, ctx, animations, shapeCanvases, tileSize) {
    try {
        board[row1][col1].disappearing = true;
        board[row2][col2].disappearing = true;
        collectedShapes[ALL_SHAPES[board[row1][col1].type]] = (collectedShapes[ALL_SHAPES[board[row1][col1].type]] || 0) + 1;
        collectedShapes[ALL_SHAPES[board[row2][col2].type]] = (collectedShapes[ALL_SHAPES[board[row2][col2].type]] || 0) + 1;
        score += 100;
        dropTiles(board, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize);
        fillBoard(board, ALL_SHAPES, animations, renderCallback, validateBoard, ctx, shapeCanvases, tileSize);
        updateScoreDisplay();
        updateTaskDisplay(task, collectedShapes, movesLeft);
        checkTaskCompletion();
    } catch (e) {
        console.error(`Failed to handle bonus star swap: ${e.message}`);
    }
}
