"use strict";

/* =========================
   캔버스 가져오기
========================= */

const gameCanvas = document.getElementById("gameCanvas");
const gameContext = gameCanvas.getContext("2d");

const nextCanvas = document.getElementById("nextCanvas");
const nextContext = nextCanvas.getContext("2d");


/* =========================
   화면 요소 가져오기
========================= */

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const levelElement = document.getElementById("level");
const linesElement = document.getElementById("lines");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");

const gameOverlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayStartButton = document.getElementById("overlayStartButton");

const controlButtons = document.querySelectorAll(".control-button");


/* =========================
   게임 기본 설정
========================= */

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const NEXT_BLOCK_SIZE = 24;

const EMPTY_COLOR = "#080b16";
const GRID_COLOR = "rgba(255, 255, 255, 0.045)";

gameContext.scale(BLOCK_SIZE, BLOCK_SIZE);


/* =========================
   테트리스 블록 모양
========================= */

const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],

    O: [
        [1, 1],
        [1, 1]
    ],

    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],

    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};


/* =========================
   블록 색상
========================= */

const COLORS = {
    I: "#38d9ff",
    J: "#4b65ff",
    L: "#ff9f2e",
    O: "#ffd93d",
    S: "#48db7f",
    T: "#b264ff",
    Z: "#ff526a"
};

const BLOCK_TYPES = Object.keys(SHAPES);


/* =========================
   게임 데이터
========================= */

let board = createBoard();

let currentPiece = null;
let nextPiece = null;

let score = 0;
let lines = 0;
let level = 1;

let highScore = Number(localStorage.getItem("tetrisHighScore")) || 0;

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;

let animationId = null;

let isRunning = false;
let isPaused = false;
let isGameOver = false;


/* =========================
   게임판 생성
========================= */

function createBoard() {
    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(null)
    );
}


/* =========================
   랜덤 블록 만들기
========================= */

function createRandomPiece() {
    const randomType =
        BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];

    const matrix = SHAPES[randomType].map(row => [...row]);

    return {
        type: randomType,
        matrix,
        color: COLORS[randomType],
        x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2),
        y: 0
    };
}


/* =========================
   게임 시작
========================= */

function startGame() {
    cancelAnimationFrame(animationId);

    board = createBoard();

    score = 0;
    lines = 0;
    level = 1;

    dropCounter = 0;
    dropInterval = 800;
    lastTime = performance.now();

    isRunning = true;
    isPaused = false;
    isGameOver = false;

    currentPiece = createRandomPiece();
    nextPiece = createRandomPiece();

    gameOverlay.classList.add("hidden");

    startButton.textContent = "다시 시작";
    pauseButton.textContent = "일시정지";
    pauseButton.disabled = false;

    updateInformation();
    draw();

    animationId = requestAnimationFrame(update);
}


/* =========================
   게임 반복 실행
========================= */

function update(time = 0) {
    if (!isRunning || isPaused || isGameOver) {
        return;
    }

    const deltaTime = time - lastTime;

    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter >= dropInterval) {
        movePieceDown();
        dropCounter = 0;
    }

    draw();

    animationId = requestAnimationFrame(update);
}


/* =========================
   전체 화면 그리기
========================= */

function draw() {
    clearGameCanvas();
    drawGrid();
    drawBoard();
    drawGhostPiece();

    if (currentPiece) {
        drawPiece(currentPiece);
    }

    drawNextPiece();
}


/* =========================
   게임 화면 초기화
========================= */

function clearGameCanvas() {
    gameContext.fillStyle = EMPTY_COLOR;
    gameContext.fillRect(0, 0, COLS, ROWS);
}


/* =========================
   배경 격자 그리기
========================= */

function drawGrid() {
    gameContext.strokeStyle = GRID_COLOR;
    gameContext.lineWidth = 0.025;

    for (let x = 0; x <= COLS; x++) {
        gameContext.beginPath();
        gameContext.moveTo(x, 0);
        gameContext.lineTo(x, ROWS);
        gameContext.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
        gameContext.beginPath();
        gameContext.moveTo(0, y);
        gameContext.lineTo(COLS, y);
        gameContext.stroke();
    }
}


/* =========================
   쌓인 블록 그리기
========================= */

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((cellColor, x) => {
            if (cellColor) {
                drawBlock(gameContext, x, y, cellColor, 1);
            }
        });
    });
}


/* =========================
   움직이는 블록 그리기
========================= */

function drawPiece(piece, alpha = 1) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(
                    gameContext,
                    piece.x + x,
                    piece.y + y,
                    piece.color,
                    alpha
                );
            }
        });
    });
}


/* =========================
   블록 한 칸 그리기
========================= */

function drawBlock(context, x, y, color, alpha = 1) {
    context.save();

    context.globalAlpha = alpha;

    context.fillStyle = color;
    context.fillRect(
        x + 0.06,
        y + 0.06,
        0.88,
        0.88
    );

    context.fillStyle = "rgba(255, 255, 255, 0.22)";
    context.fillRect(
        x + 0.1,
        y + 0.1,
        0.78,
        0.11
    );

    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(
        x + 0.1,
        y + 0.77,
        0.78,
        0.11
    );

    context.restore();
}


/* =========================
   블록이 떨어질 위치 표시
========================= */

function drawGhostPiece() {
    if (!currentPiece) {
        return;
    }

    const ghostPiece = {
        ...currentPiece,
        matrix: currentPiece.matrix.map(row => [...row])
    };

    while (!hasCollision(ghostPiece, 0, 1)) {
        ghostPiece.y++;
    }

    drawPiece(ghostPiece, 0.18);
}


/* =========================
   다음 블록 표시
========================= */

function drawNextPiece() {
    nextContext.clearRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );

    nextContext.fillStyle = "#0a0e1c";
    nextContext.fillRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );

    if (!nextPiece) {
        return;
    }

    const matrix = nextPiece.matrix;

    const pieceWidth = matrix[0].length * NEXT_BLOCK_SIZE;
    const pieceHeight = matrix.length * NEXT_BLOCK_SIZE;

    const offsetX = (nextCanvas.width - pieceWidth) / 2;
    const offsetY = (nextCanvas.height - pieceHeight) / 2;

    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (!value) {
                return;
            }

            const drawX = offsetX + x * NEXT_BLOCK_SIZE;
            const drawY = offsetY + y * NEXT_BLOCK_SIZE;

            nextContext.fillStyle = nextPiece.color;
            nextContext.fillRect(
                drawX + 2,
                drawY + 2,
                NEXT_BLOCK_SIZE - 4,
                NEXT_BLOCK_SIZE - 4
            );

            nextContext.fillStyle = "rgba(255, 255, 255, 0.22)";
            nextContext.fillRect(
                drawX + 4,
                drawY + 4,
                NEXT_BLOCK_SIZE - 8,
                3
            );
        });
    });
}


/* =========================
   충돌 검사
========================= */

function hasCollision(piece, offsetX = 0, offsetY = 0) {
    return piece.matrix.some((row, y) => {
        return row.some((value, x) => {
            if (!value) {
                return false;
            }

            const newX = piece.x + x + offsetX;
            const newY = piece.y + y + offsetY;

            const outsideLeft = newX < 0;
            const outsideRight = newX >= COLS;
            const outsideBottom = newY >= ROWS;

            if (outsideLeft || outsideRight || outsideBottom) {
                return true;
            }

            if (newY < 0) {
                return false;
            }

            return board[newY][newX] !== null;
        });
    });
}


/* =========================
   좌우 이동
========================= */

function movePieceHorizontal(direction) {
    if (!canControlPiece()) {
        return;
    }

    if (!hasCollision(currentPiece, direction, 0)) {
        currentPiece.x += direction;
        draw();
    }
}


/* =========================
   아래로 이동
========================= */

function movePieceDown(isManual = false) {
    if (!canControlPiece()) {
        return;
    }

    if (!hasCollision(currentPiece, 0, 1)) {
        currentPiece.y++;

        if (isManual) {
            score += 1;
            updateInformation();
        }
    } else {
        lockPiece();
    }

    dropCounter = 0;
}


/* =========================
   한 번에 내리기
========================= */

function hardDrop() {
    if (!canControlPiece()) {
        return;
    }

    let dropDistance = 0;

    while (!hasCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
        dropDistance++;
    }

    score += dropDistance * 2;

    lockPiece();
    dropCounter = 0;
}


/* =========================
   블록 회전
========================= */

function rotatePiece() {
    if (!canControlPiece()) {
        return;
    }

    const originalMatrix = currentPiece.matrix.map(row => [...row]);
    const originalX = currentPiece.x;

    currentPiece.matrix = rotateMatrix(currentPiece.matrix);

    /*
        회전 후 벽이나 쌓인 블록에 걸리면
        좌우로 조금 이동시켜 회전을 시도한다.
    */
    const wallKickOffsets = [0, -1, 1, -2, 2];

    for (const offset of wallKickOffsets) {
        currentPiece.x = originalX + offset;

        if (!hasCollision(currentPiece)) {
            draw();
            return;
        }
    }

    /*
        어느 위치에서도 회전할 수 없다면
        회전 전 상태로 되돌린다.
    */
    currentPiece.matrix = originalMatrix;
    currentPiece.x = originalX;
}


/* =========================
   행렬 회전
========================= */

function rotateMatrix(matrix) {
    return matrix[0].map((_, columnIndex) =>
        matrix.map(row => row[columnIndex]).reverse()
    );
}


/* =========================
   블록을 게임판에 고정
========================= */

function lockPiece() {
    currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (!value) {
                return;
            }

            const boardX = currentPiece.x + x;
            const boardY = currentPiece.y + y;

            if (boardY >= 0) {
                board[boardY][boardX] = currentPiece.color;
            }
        });
    });

    clearCompletedLines();
    createNextCurrentPiece();
}


/* =========================
   완성된 줄 제거
========================= */

function clearCompletedLines() {
    let clearedLines = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
        const isFullLine = board[y].every(cell => cell !== null);

        if (!isFullLine) {
            continue;
        }

        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));

        clearedLines++;
        y++;
    }

    if (clearedLines === 0) {
        return;
    }

    const scoreTable = {
        1: 100,
        2: 300,
        3: 500,
        4: 800
    };

    score += scoreTable[clearedLines] * level;
    lines += clearedLines;

    level = Math.floor(lines / 10) + 1;

    /*
        레벨이 올라갈수록 블록이 빨라진다.
        최소 속도는 100ms로 제한한다.
    */
    dropInterval = Math.max(
        100,
        800 - (level - 1) * 70
    );

    updateHighScore();
    updateInformation();
}


/* =========================
   다음 블록 가져오기
========================= */

function createNextCurrentPiece() {
    currentPiece = nextPiece;
    currentPiece.x =
        Math.floor(COLS / 2) -
        Math.ceil(currentPiece.matrix[0].length / 2);

    currentPiece.y = 0;

    nextPiece = createRandomPiece();

    if (hasCollision(currentPiece)) {
        endGame();
        return;
    }

    updateHighScore();
    updateInformation();
    draw();
}


/* =========================
   일시정지
========================= */

function togglePause() {
    if (!isRunning || isGameOver) {
        return;
    }

    isPaused = !isPaused;

    if (isPaused) {
        cancelAnimationFrame(animationId);

        pauseButton.textContent = "계속하기";

        overlayTitle.textContent = "PAUSED";
        overlayText.textContent = "잠시 멈췄습니다.";
        overlayStartButton.textContent = "계속하기";

        gameOverlay.classList.remove("hidden");
    } else {
        pauseButton.textContent = "일시정지";

        gameOverlay.classList.add("hidden");

        lastTime = performance.now();
        animationId = requestAnimationFrame(update);
    }
}


/* =========================
   게임 종료
========================= */

function endGame() {
    isGameOver = true;
    isRunning = false;

    cancelAnimationFrame(animationId);

    updateHighScore();
    updateInformation();

    pauseButton.disabled = true;

    overlayTitle.textContent = "GAME OVER";
    overlayText.textContent = `최종 점수는 ${score.toLocaleString()}점입니다.`;
    overlayStartButton.textContent = "다시 시작";

    gameOverlay.classList.remove("hidden");
}


/* =========================
   점수 정보 업데이트
========================= */

function updateInformation() {
    scoreElement.textContent = score.toLocaleString();
    highScoreElement.textContent = highScore.toLocaleString();
    levelElement.textContent = level;
    linesElement.textContent = lines;
}


/* =========================
   최고 점수 저장
========================= */

function updateHighScore() {
    if (score <= highScore) {
        return;
    }

    highScore = score;

    localStorage.setItem(
        "tetrisHighScore",
        String(highScore)
    );
}


/* =========================
   조작 가능한 상태 확인
========================= */

function canControlPiece() {
    return (
        isRunning &&
        !isPaused &&
        !isGameOver &&
        currentPiece
    );
}


/* =========================
   키보드 조작
========================= */

document.addEventListener("keydown", event => {
    const controlledKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp",
        "Space"
    ];

    if (controlledKeys.includes(event.code)) {
        event.preventDefault();
    }

    switch (event.code) {
        case "ArrowLeft":
            movePieceHorizontal(-1);
            break;

        case "ArrowRight":
            movePieceHorizontal(1);
            break;

        case "ArrowDown":
            movePieceDown(true);
            break;

        case "ArrowUp":
            rotatePiece();
            break;

        case "Space":
            hardDrop();
            break;

        case "KeyP":
        case "Escape":
            togglePause();
            break;
    }
});


/* =========================
   모바일 버튼 조작
========================= */

controlButtons.forEach(button => {
    button.addEventListener("pointerdown", event => {
        event.preventDefault();

        const action = button.dataset.action;

        switch (action) {
            case "left":
                movePieceHorizontal(-1);
                break;

            case "right":
                movePieceHorizontal(1);
                break;

            case "down":
                movePieceDown(true);
                break;

            case "rotate":
                rotatePiece();
                break;

            case "drop":
                hardDrop();
                break;
        }
    });
});


/* =========================
   일반 버튼 이벤트
========================= */

startButton.addEventListener("click", startGame);

pauseButton.addEventListener("click", togglePause);

overlayStartButton.addEventListener("click", () => {
    if (isPaused && !isGameOver) {
        togglePause();
        return;
    }

    startGame();
});


/* =========================
   브라우저 창을 벗어나면 정지
========================= */

document.addEventListener("visibilitychange", () => {
    if (
        document.hidden &&
        isRunning &&
        !isPaused &&
        !isGameOver
    ) {
        togglePause();
    }
});


/* =========================
   최초 화면 표시
========================= */

highScoreElement.textContent = highScore.toLocaleString();

draw();