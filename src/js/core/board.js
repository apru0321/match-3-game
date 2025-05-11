import { GRID_WIDTH, GRID_HEIGHT, ALL_SHAPES } from '../constants.js';

export function validateBoard(board, GRID_HEIGHT, GRID_WIDTH) {
    console.log(`GRID_WIDTH === ${GRID_WIDTH}`);
    console.log(`GRID_HEIGHT === ${GRID_HEIGHT}`);
    if (!Array.isArray(board) || board.length !== GRID_HEIGHT) {
        throw new Error(`Invalid board: expected ${GRID_HEIGHT} rows, got ${board.length}`);
    }
    for (let row = 0; row < GRID_HEIGHT; row++) {
        if (!Array.isArray(board[row]) || board[row].length !== GRID_WIDTH) {
            throw new Error(`Invalid board row ${row}: expected ${WIRE_WIDTH} columns, got ${board[row]?.length || 'undefined'}`);
        }
    }
}

export function initBoard(board, GRID_HEIGHT, GRID_WIDTH, selectedShapes, TILE_SIZE, resolveInitialMatches, validateBoard) {
    console.log('Initializing board...');
    try {
        board.length = 0;
        board.push(...Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null)));
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                board[row][col] = {
                    type: Math.floor(Math.random() * selectedShapes.length),
                    bonusType: null,
                    x: col * TILE_SIZE,
                    y: row * TILE_SIZE,
                    targetX: col * TILE_SIZE,
                    targetY: row * TILE_SIZE,
                    disappearing: false,
                    disappearProgress: 0
                };
            }
        }
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
        console.log('Str 36 board...');
        console.log(`selectedShapes === ${selectedShapes}`);
        console.log(`validateBoard === ${validateBoard}`);
        resolveInitialMatches(board, selectedShapes, validateBoard);
        console.log('Board initialized successfully');
    } catch (e) {
        console.error(`Failed to initialize board: ${e.message}`);
        throw e;
    }
}

export function resolveInitialMatches(board, selectedShapes, validateBoard) {
    console.log('Resolving initial matches...');
    try {
        let iteration = 0;
        const maxIterations = 100;
        while (true) {
            const matches = checkMatches(board, selectedShapes);
            if (!matches || iteration >= maxIterations) {
                console.log(`Initial matches resolved after ${iteration} iterations`);
                break;
            }
            matches.forEach(match => {
                match.positions.forEach(pos => {
                    board[pos.row][pos.col].type = Math.floor(Math.random() * selectedShapes.length);
                    board[pos.row][pos.col].bonusType = null;
                });
            });
            validateBoard(board);
            iteration++;
        }
    } catch (e) {
        console.error(`Failed to resolve initial matches: ${e.message}`);
        throw e;
    }
}

export function checkMatches(board, selectedShapes) {
    console.log('Checking matches...');
    try {
        const matches = [];

        for (let row = 0; row < GRID_HEIGHT; row++) {
            let col = 0;
            while (col < GRID_WIDTH) {
                const currentTile = board[row][col];
                if (!currentTile || currentTile.bonusType || currentTile.disappearing) {
                    col++;
                    continue;
                }
                const type = currentTile.type;
                let matchLength = 1;
                let matchCols = [col];
                let nextCol = col + 1;
                while (nextCol < GRID_WIDTH) {
                    const nextTile = board[row][nextCol];
                    if (!nextTile || nextTile.type !== type || nextTile.bonusType || nextTile.disappearing) break;
                    matchCols.push(nextCol);
                    matchLength++;
                    nextCol++;
                }
                if (matchLength >= 3) {
                    matches.push({ positions: matchCols.map(c => ({ row, col: c })), length: matchLength, direction: 'horizontal', type });
                    console.log(`Horizontal match at row ${row}: ${matchLength} ${selectedShapes[type]} tiles`);
                }
                col = nextCol;
            }
        }

        for (let col = 0; col < GRID_WIDTH; col++) {
            let row = 0;
            while (row < GRID_HEIGHT) {
                const currentTile = board[row][col];
                if (!currentTile || currentTile.bonusType || currentTile.disappearing) {
                    row++;
                    continue;
                }
                const type = currentTile.type;
                let matchLength = 1;
                let matchRows = [row];
                let nextRow = row + 1;
                while (nextRow < GRID_HEIGHT) {
                    const nextTile = board[nextRow][col];
                    if (!nextTile || nextTile.type !== type || nextTile.bonusType || nextTile.disappearing) break;
                    matchRows.push(nextRow);
                    matchLength++;
                    nextRow++;
                }
                if (matchLength >= 3) {
                    matches.push({ positions: matchRows.map(r => ({ row: r, col })), length: matchLength, direction: 'vertical', type });
                    console.log(`Vertical match at col ${col}: ${matchLength} ${selectedShapes[type]} tiles`);
                }
                row = nextRow;
            }
        }

        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const currentTile = board[row][col];
                if (!currentTile || currentTile.bonusType || currentTile.disappearing) continue;
                const type = currentTile.type;
                let hCount = 1, vCount = 1;
                let hPositions = [{ row, col }], vPositions = [{ row, col }];

                for (let c = col + 1; c < GRID_WIDTH; c++) {
                    const tile = board[row][c];
                    if (!tile || tile.type !== type || tile.bonusType || tile.disappearing) break;
                    hPositions.push({ row, col: c });
                    hCount++;
                }
                for (let c = col - 1; c >= 0; c--) {
                    const tile = board[row][c];
                    if (!tile || tile.type !== type || tile.bonusType || tile.disappearing) break;
                    hPositions.push({ row, col: c });
                    hCount++;
                }

                for (let r = row + 1; r < GRID_HEIGHT; r++) {
                    const tile = board[r][col];
                    if (!tile || tile.type !== type || tile.bonusType || tile.disappearing) break;
                    vPositions.push({ row: r, col });
                    vCount++;
                }
                for (let r = row - 1; r >= 0; r--) {
                    const tile = board[r][col];
                    if (!tile || tile.type !== type || tile.bonusType || tile.disappearing) break;
                    vPositions.push({ row: r, col });
                    vCount++;
                }

                if (hCount >= 3 && vCount >= 3) {
                    const positions = [...hPositions, ...vPositions.filter(p => !hPositions.some(hp => hp.row === p.row && hp.col === p.col))];
                    if (positions.length >= 5) {
                        matches.push({ positions, length: positions.length, direction: 'l-shaped', intersection: { row, col }, type });
                        console.log(`L-shaped match at (${row}, ${col}): ${positions.length} tiles`);
                    }
                }
            }
        }

        return matches.length > 0 ? matches : null;
    } catch (e) {
        console.error(`Error in checkMatches: ${e.message}`);
        return null;
    }
}

export async function handleMatches(board, selectedShapes, task, collectedShapes, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkTaskCompletion) {
    console.log('Handling matches...');
    try {
        let matches = checkMatches(board, selectedShapes);
        while (matches) {
            const tilesToRemove = new Set();
            const bonusTilesToPlace = [];
            let bonusStarPlaced = false;

            matches.forEach(match => {
                let bonusType = null;
                let bonusPos = null;
                if (match.length === 4) {
                    if (match.direction === 'vertical') {
                        bonusType = 'horizontal_arrow';
                        bonusPos = match.positions.sort((a, b) => b.row - a.row)[0];
                    } else if (match.direction === 'horizontal') {
                        bonusType = 'vertical_arrow';
                        bonusPos = match.positions.sort((a, b) => b.col - a.col)[0];
                    }
                } else if (match.length >= 5 && match.direction === 'l-shaped' && !bonusStarPlaced) {
                    bonusType = 'bonus_star';
                    bonusPos = match.intersection;
                    bonusStarPlaced = true;
                }
                match.positions.forEach(pos => {
                    const tile = board[pos.row][pos.col];
                    if (tile && !tile.disappearing) {
                        tile.disappearing = true;
                        tile.disappearProgress = 0;
                        tilesToRemove.add(`${pos.row},${pos.col}`);
                        if (selectedShapes[tile.type] === task.shape && !tile.bonusType) {
                            collectedShapes[task.shape]++;
                        }
                    }
                });
                if (bonusType && bonusPos) {
                    bonusTilesToPlace.push({ row: bonusPos.row, col: bonusPos.col, bonusType });
                    console.log(`Scheduled bonus tile: ${bonusType} at (${bonusPos.row}, ${bonusPos.col})`);
                }
            });

            const points = tilesToRemove.size * 10;
            taskScore += points;
            updateScoreDisplay();
            updateTaskDisplay();
            render();
            await new Promise(resolve => setTimeout(resolve, 400));

            tilesToRemove.forEach(pos => {
                const [row, col] = pos.split(',').map(Number);
                board[row][col] = null;
            });

            dropTiles(board, GRID_HEIGHT, GRID_WIDTH, validateBoard);
            fillBoard(board, GRID_HEIGHT, GRID_WIDTH, selectedShapes, animations, validateBoard);
            validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
            bonusTilesToPlace.forEach(bonus => {
                console.log(`Placing bonus tile: ${bonus.bonusType} at (${bonus.row}, ${bonus.col})`);
                board[bonus.row][bonus.col].bonusType = bonus.bonusType;
                board[bonus.row][bonus.col].type = 0;
            });

            render();
            await new Promise(resolve => setTimeout(resolve, 400));
            matches = checkMatches(board, selectedShapes);
        }
        checkTaskCompletion();
    } catch (e) {
        console.error(`Error in handleMatches: ${e.message}`);
    }
}

export function dropTiles(board, GRID_HEIGHT, GRID_WIDTH, validateBoard, animations) {
    try {
        for (let col = 0; col < GRID_WIDTH; col++) {
            let emptyRow = GRID_HEIGHT - 1;
            for (let row = GRID_HEIGHT - 1; row >= 0; row--) {
                if (board[row][col] && !board[row][col].disappearing) {
                    if (row !== emptyRow) {
                        board[emptyRow][col] = board[row][col];
                        board[emptyRow][col].targetY = emptyRow * TILE_SIZE;
                        animations.push({ row: emptyRow, col });
                        board[row][col] = null;
                    }
                    emptyRow--;
                }
            }
        }
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
    } catch (e) {
        console.error(`Error in dropTiles: ${e.message}`);
    }
}

export function fillBoard(board, GRID_HEIGHT, GRID_WIDTH, selectedShapes, animations, validateBoard, TILE_SIZE) {
    try {
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                if (!board[row][col]) {
                    board[row][col] = {
                        type: Math.floor(Math.random() * selectedShapes.length),
                        bonusType: null,
                        x: col * TILE_SIZE,
                        y: -TILE_SIZE,
                        targetX: col * TILE_SIZE,
                        targetY: row * TILE_SIZE,
                        disappearing: false,
                        disappearProgress: 0
                    };
                    animations.push({ row, col });
                }
            }
        }
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
    } catch (e) {
        console.error(`Error in fillBoard: ${e.message}`);
    }
}

export async function handleBonusTileAction(board, row, col, bonusType, GRID_HEIGHT, GRID_WIDTH, selectedShapes, task, collectedShapes, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches) {
    console.log(`Activating bonus tile: ${bonusType} at (${row}, ${col})`);
    try {
        let tilesToRemove = [];
        if (bonusType === 'horizontal_arrow') {
            for (let c = 0; c < GRID_WIDTH; c++) {
                if (board[row][c] && !board[row][c].disappearing) {
                    tilesToRemove.push({ row, col: c });
                }
            }
        } else if (bonusType === 'vertical_arrow') {
            for (let r = 0; r < GRID_HEIGHT; r++) {
                if (board[r][col] && !board[r][col].disappearing) {
                    tilesToRemove.push({ row: r, col });
                }
            }
        }

        let points = 0;
        tilesToRemove.forEach(pos => {
            const tile = board[pos.row][pos.col];
            tile.disappearing = true;
            tile.disappearProgress = 0;
            if (selectedShapes[tile.type] === task.shape && !tile.bonusType) {
                collectedShapes[task.shape]++;
            }
            points += 10;
        });

        taskScore += points;
        updateScoreDisplay();
        updateTaskDisplay();
        render();
        await new Promise(resolve => setTimeout(resolve, 400));

        tilesToRemove.forEach(pos => {
            board[pos.row][pos.col] = null;
        });

        dropTiles(board, GRID_HEIGHT, GRID_WIDTH, validateBoard);
        fillBoard(board, GRID_HEIGHT, GRID_WIDTH, selectedShapes, animations, validateBoard);
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
        render();
        await new Promise(resolve => setTimeout(resolve, 400));

        const matches = checkMatches(board, selectedShapes);
        if (matches) {
            await handleMatches(board, selectedShapes, task, collectedShapes, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkTaskCompletion);
        }
    } catch (e) {
        console.error(`Error in handleBonusTileAction: ${e.message}`);
    }
}

export async function handleBonusStarSwap(board, r1, c1, r2, c2, GRID_HEIGHT, GRID_WIDTH, selectedShapes, task, collectedShapes, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkMatches, handleMatches) {
    try {
        const tile1 = board[r1][c1];
        const tile2 = board[r2][c2];
        const targetType = tile1.bonusType === 'bonus_star' ? tile2.type : tile1.type;
        console.log(`Bonus star swap: removing all ${selectedShapes[targetType]} tiles`);

        let tilesToRemove = [];
        for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
                if (board[r][c] && board[r][c].type === targetType && !board[r][c].disappearing) {
                    tilesToRemove.push({ row: r, col: c });
                }
            }
        }

        const starPos = tile1.bonusType === 'bonus_star' ? { row: r1, col: c1 } : { row: r2, col: c2 };
        tilesToRemove.push(starPos);

        let points = 0;
        tilesToRemove.forEach(pos => {
            const tile = board[pos.row][pos.col];
            if (tile) {
                tile.disappearing = true;
                tile.disappearProgress = 0;
                if (selectedShapes[tile.type] === task.shape && !tile.bonusType) {
                    collectedShapes[task.shape]++;
                }
                points += 10;
            }
        });

        taskScore += points;
        updateScoreDisplay();
        updateTaskDisplay();
        render();
        await new Promise(resolve => setTimeout(resolve, 400));

        tilesToRemove.forEach(pos => {
            board[pos.row][pos.col] = null;
        });

        dropTiles(board, GRID_HEIGHT, GRID_WIDTH, validateBoard);
        fillBoard(board, GRID_HEIGHT, GRID_WIDTH, selectedShapes, animations, validateBoard);
        validateBoard(board, GRID_HEIGHT, GRID_WIDTH);
        render();
        await new Promise(resolve => setTimeout(resolve, 400));

        const matches = checkMatches(board, selectedShapes);
        if (matches) {
            await handleMatches(board, selectedShapes, task, collectedShapes, taskScore, updateScoreDisplay, updateTaskDisplay, render, dropTiles, fillBoard, validateBoard, checkTaskCompletion);
        }
    } catch (e) {
        console.error(`Error in handleBonusStarSwap: ${e.message}`);
    }
}

export async function swapTiles(board, r1, c1, r2, c2, animations, render, validateBoard, TILE_SIZE) {
    try {
        const tile1 = board[r1][c1];
        const tile2 = board[r2][c2];
        board[r1][c1] = tile2;
        board[r2][c2] = tile1;

        tile1.targetX = c2 * TILE_SIZE;
        tile1.targetY = r2 * TILE_SIZE;
        tile2.targetX = c1 * TILE_SIZE;
        tile2.targetY = r1 * TILE_SIZE;

        animations.push({ row: r1, col: c1 }, { row: r2, col: c2 });
        render();
        await new Promise(resolve => setTimeout(resolve, 200));
        validateBoard(board);
    } catch (e) {
        console.error(`Error in swapTiles: ${e.message}`);
    }
}
