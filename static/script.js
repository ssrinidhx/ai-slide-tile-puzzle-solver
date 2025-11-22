const gridSize = 3; 
let grid = [];
let empty = { row: gridSize - 1, col: gridSize - 1 };
let goal = [];
let movesQueue = [];
let autoInterval = null;
const colors = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#e84393','#95a5a6','#16a085','#f39c12','#d35400','#2c3e50','#7f8c8d','#27ae60'];

let moveCount = 0;
let startTime = null;

function initGame() {
    grid = [];
    goal = [];
    moveCount = 0;
    startTime = null;
    movesQueue = [];
    document.getElementById('moveCount').textContent = moveCount;
    document.getElementById('timer').textContent = '0.0';
    let numbers = [];
    for (let i = 1; i < gridSize * gridSize; i++) numbers.push(i);
    numbers.push(0); 
    for (let r = 0; r < gridSize; r++) {
        let row = [];
        for (let c = 0; c < gridSize; c++) {
            row.push(numbers[r * gridSize + c]);
        }
        goal.push([...row]);
    }
    let attempts = 0;
    do {
        grid = make2D(shuffleGrid([...numbers]));
        attempts++;
        if (attempts > 1000) break; 
    } while (!isSolvable(grid));
    empty = findEmpty(grid);
    renderGrid();
    log('Game Started!');
}

function make2D(arr) {
    let result = [];
    for (let i = 0; i < gridSize; i++) {
        result.push(arr.slice(i * gridSize, (i + 1) * gridSize));
    }
    return result;
}

function findEmpty(grid) {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === 0) return { row: r, col: c };
        }
    }
}

function shuffleGrid(arr) {
    let a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function isSolvable(grid) {
    const arr = grid.flat();
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] && arr[j] && arr[i] > arr[j]) inversions++;
        }
    }
    return inversions % 2 === 0;
}

function renderGrid() {
    const container = document.getElementById('grid');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const val = grid[r][c];
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (val === 0) tile.classList.add('empty');
            else {
                tile.style.backgroundColor = colors[(val - 1) % colors.length];
                tile.textContent = val;
            }
            container.appendChild(tile);
        }
    }
}

function log(msg) {
    const l = document.getElementById('log');
    l.innerHTML += msg + '<br>';
    l.scrollTop = l.scrollHeight;
}

function checkWin() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] !== goal[r][c]) return false;
        }
    }
    return true;
}

function computeAStar() {
    const start = grid.flat();
    const goalFlat = goal.flat();
    const dirs = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];
    const visited = new Set();
    const pq = [{ state: start, empty: empty, path: [] }];
    while (pq.length > 0) {
        pq.sort((a, b) => heuristic(a.state) - heuristic(b.state));
        const node = pq.shift();
        const key = node.state.join(',');
        if (visited.has(key)) continue;
        visited.add(key);
        if (key === goalFlat.join(',')) return node.path;
        const emptyIdx = node.state.indexOf(0);
        const r = Math.floor(emptyIdx / gridSize);
        const c = emptyIdx % gridSize;
        for (const d of dirs) {
            const nr = r + d.r;
            const nc = c + d.c;
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
                const newState = [...node.state];
                const swapIdx = nr * gridSize + nc;
                [newState[emptyIdx], newState[swapIdx]] = [newState[swapIdx], newState[emptyIdx]];
                pq.push({ state: newState, empty: { row: nr, col: nc }, path: [...node.path, newState] });
            }
        }
    }
    return [];
}

function heuristic(state) {
    let dist = 0;
    for (let i = 0; i < state.length; i++) {
        if (state[i] === 0) continue;
        const val = state[i] - 1;
        const r1 = Math.floor(i / gridSize), c1 = i % gridSize;
        const r2 = Math.floor(val / gridSize), c2 = val % gridSize;
        dist += Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }
    return dist;
}

function agentStep() {
    if (movesQueue.length === 0) {
        movesQueue = computeAStar();
        if (movesQueue.length === 0) { log("No solution!"); return; }
        startTime = performance.now();
    }
    const next = movesQueue.shift();
    const prevFlat = grid.flat();
    const nextFlat = next.flat();
    let movedTile = 0;
    for (let i = 0; i < prevFlat.length; i++) {
        if (prevFlat[i] !== 0 && prevFlat[i] !== nextFlat[i]) {
            movedTile = prevFlat[i];
            break;
        }
    }
    grid = make2D(next);
    empty = findEmpty(grid);
    moveCount++;
    document.getElementById('moveCount').textContent = moveCount;
    renderGrid();
    log(`Agent moved tile ${movedTile}`);
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    document.getElementById('timer').textContent = elapsed;
    if (checkWin()) {
        const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
        log(`✅ Puzzle Solved in ${moveCount} moves and ${totalTime} seconds!`);
        movesQueue = [];
        stopAutoSolve();
    }
}

function startAutoSolve() {
    if (autoInterval) clearInterval(autoInterval);
    movesQueue = computeAStar();
    if (movesQueue.length === 0) { log("No solution!"); return; }
    startTime = performance.now();
    const btn = document.getElementById('autoBtn');
    btn.textContent = 'Stop';
    autoInterval = setInterval(() => {
        if (movesQueue.length === 0 || checkWin()) {
            stopAutoSolve();
            return;
        }
        agentStep(); 
    }, 300);
}

function toggleAutoSolve() {
    if (autoInterval) stopAutoSolve();
    else startAutoSolve();
}

function stopAutoSolve() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        const btn = document.getElementById('autoBtn');
        btn.textContent = 'Auto Solve';
        log('⏹ Auto-solve stopped!');
    }
}

function resetGame() {
    stopAutoSolve();
    moveCount = 0;
    movesQueue = [];
    document.getElementById('log').innerHTML = '';
    document.getElementById('moveCount').textContent = moveCount;
    document.getElementById('timer').textContent = '0.0';
    initGame();
}

function newGame() {
    stopAutoSolve();
    document.getElementById('log').innerHTML = '';
    moveCount = 0;
    movesQueue = [];
    document.getElementById('moveCount').textContent = moveCount;
    document.getElementById('timer').textContent = '0.0';
    initGame();
}

initGame();
