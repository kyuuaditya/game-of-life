document.addEventListener('DOMContentLoaded', () => {
    // ## Canvas and Context Setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ## DOM Element References
    const startStopBtn = document.getElementById('startStopBtn');
    const clearBtn = document.getElementById('clearBtn');
    const randomBtn = document.getElementById('randomBtn');
    const generationCounter = document.getElementById('generationCounter');

    // ## Grid Configuration ##
    const cellSize = 15;
    const canvasWidth = 1200;
    const canvasHeight = 660;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const cols = Math.floor(canvasWidth / cellSize);
    const rows = Math.floor(canvasHeight / cellSize);
    
    // ## Colors
    const LIVE_COLOR = "#333333ff";
    const DEAD_COLOR = "#f0f0f0ff";
    const GRID_COLOR = "#ccccccff";

    // ## Simulation State
    let grid = createGrid();
    let isRunning = false;
    let generation = 0;
    let animationId = null;

    // ## Utility Functions
    function createGrid() {
        return new Array(rows).fill(null)
            .map(() => new Array(cols).fill(0));
    }

    function randomizeGrid() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                grid[row][col] = Math.random() > 0.75 ? 1 : 0;
            }
        }
    }
    
    // ## Drawing Functions
    function drawGrid() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                ctx.fillStyle = grid[row][col] ? LIVE_COLOR : DEAD_COLOR;
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }

        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvasHeight);
            ctx.stroke();
        }
        for (let j = 0; j <= rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * cellSize);
            ctx.lineTo(canvasWidth, j * cellSize);
            ctx.stroke();
        }
    }

    // ## Game Logic
    function computeNextGeneration() {
        const nextGrid = createGrid();

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const neighbors = countNeighbors(row, col);
                const isAlive = grid[row][col] === 1;

                if (isAlive && (neighbors < 2 || neighbors > 3)) {
                    nextGrid[row][col] = 0;
                } else if (!isAlive && neighbors === 3) {
                    nextGrid[row][col] = 1;
                } else {
                    nextGrid[row][col] = grid[row][col];
                }
            }
        }
        return nextGrid;
    }

    function countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const x = (col + j + cols) % cols;
                const y = (row + i + rows) % rows;

                count += grid[y][x];
            }
        }
        return count;
    }

    // ## Simulation Control
    function runSimulation() {
        if (!isRunning) return;
        grid = computeNextGeneration();
        drawGrid();
        generation++;
        generationCounter.textContent = `Generation: ${generation}`;
        animationId = requestAnimationFrame(runSimulation);
    }

    function start() {
        isRunning = true;
        startStopBtn.textContent = 'Stop';
        runSimulation();
    }

    function stop() {
        isRunning = false;
        startStopBtn.textContent = 'Start';
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    
    // ## Event Listeners
    startStopBtn.addEventListener('click', () => isRunning ? stop() : start());

    clearBtn.addEventListener('click', () => {
        stop();
        grid = createGrid();
        generation = 0;
        generationCounter.textContent = 'Generation: 0';
        drawGrid();
    });
    
    randomBtn.addEventListener('click', () => {
        stop();
        randomizeGrid();
        generation = 0;
        generationCounter.textContent = 'Generation: 0';
        drawGrid();
    });
    
    // ## Mouse drawing functionality ##
    let isDrawing = false;
    
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        handleCanvasInteraction(e);
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            handleCanvasInteraction(e);
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    function handleCanvasInteraction(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            if (e.buttons === 1) {
                grid[row][col] = 1;
            } else if (e.buttons === 2) {
                grid[row][col] = 0;
            }
            drawGrid();
        }
    }

    // ## Initialize Draw
    drawGrid();
});