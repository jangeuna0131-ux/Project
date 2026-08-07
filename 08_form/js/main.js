"use strict";


/* =========================
   캔버스 가져오기
========================= */

const gameCanvas =
    document.getElementById("gameCanvas");

const gameContext =
    gameCanvas.getContext("2d");


const nextCanvas =
    document.getElementById("nextCanvas");

const nextContext =
    nextCanvas.getContext("2d");


const holdCanvas =
    document.getElementById("holdCanvas");

const holdContext =
    holdCanvas.getContext("2d");


/* =========================
   화면 요소 가져오기
========================= */

const scoreElement =
    document.getElementById("score");

const highScoreElement =
    document.getElementById("highScore");

const levelElement =
    document.getElementById("level");

const linesElement =
    document.getElementById("lines");

const linesTopElement =
    document.getElementById("linesTop");

const statusText =
    document.getElementById("statusText");

const levelProgress =
    document.getElementById("levelProgress");

const playerHp =
    document.getElementById("playerHp");


const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");


const gameOverlay =
    document.getElementById("gameOverlay");

const overlayTitle =
    document.getElementById("overlayTitle");

const overlayText =
    document.getElementById("overlayText");

const overlayButton =
    document.getElementById("overlayButton");


const statisticElements =
    document.querySelectorAll("[data-stat]");

const mobileControlButtons =
    document.querySelectorAll("[data-action]");


/* =========================
   게임 기본 설정
========================= */

const COLS = 10;
const ROWS = 20;

const BLOCK_SIZE = 30;


/* =========================
   블록 색상
========================= */

const COLORS = {
    I: "#22d8ff",
    J: "#4e67ff",
    L: "#ff9228",
    O: "#ffe13b",
    S: "#4edf76",
    T: "#b65cff",
    Z: "#ff4d67"
};


/* =========================
   블록 모양
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


const TYPES = Object.keys(SHAPES);


/* =========================
   게임 데이터
========================= */

let board = createBoard();

let bag = [];
let nextQueue = [];

let currentPiece = null;

let holdType = null;
let holdUsed = false;


let score = 0;
let lines = 0;
let level = 1;


let highScore =
    Number(
        localStorage.getItem(
            "arcadeTetrisHighScore"
        )
    ) || 0;


let pieceStatistics =
    createStatistics();


let dropCounter = 0;
let dropInterval = 850;
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
   블록 통계 생성
========================= */

function createStatistics() {

    return TYPES.reduce(
        (result, type) => {

            result[type] = 0;

            return result;

        },
        {}
    );

}


/* =========================
   배열 섞기
========================= */

function shuffle(array) {

    const copiedArray = [...array];

    for (
        let index = copiedArray.length - 1;
        index > 0;
        index--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (index + 1)
            );

        [
            copiedArray[index],
            copiedArray[randomIndex]
        ] = [
            copiedArray[randomIndex],
            copiedArray[index]
        ];

    }

    return copiedArray;

}


/* =========================
   7-Bag 시스템
========================= */

function takeTypeFromBag() {

    if (bag.length === 0) {
        bag = shuffle(TYPES);
    }

    return bag.pop();

}


/* =========================
   다음 블록 채우기
========================= */

function fillNextQueue() {

    while (nextQueue.length < 5) {
        nextQueue.push(
            takeTypeFromBag()
        );
    }

}


/* =========================
   블록 생성
========================= */

function createPiece(type) {

    const matrix =
        SHAPES[type].map(
            row => [...row]
        );

    return {

        type: type,

        matrix: matrix,

        color: COLORS[type],

        x:
            Math.floor(COLS / 2) -
            Math.ceil(matrix[0].length / 2),

        y: 0

    };

}


/* =========================
   다음 블록 출현
========================= */

function spawnNextPiece() {

    fillNextQueue();

    const type = nextQueue.shift();

    fillNextQueue();

    currentPiece = createPiece(type);

    pieceStatistics[type] += 1;

    holdUsed = false;


    if (hasCollision(currentPiece)) {
        finishGame();
    }

}


/* =========================
   게임 시작
========================= */

function startGame() {

    cancelAnimationFrame(animationId);


    board = createBoard();

    bag = [];
    nextQueue = [];

    currentPiece = null;

    holdType = null;
    holdUsed = false;


    score = 0;
    lines = 0;
    level = 1;


    pieceStatistics =
        createStatistics();


    dropCounter = 0;
    dropInterval = 850;

    lastTime =
        performance.now();


    isRunning = true;
    isPaused = false;
    isGameOver = false;


    fillNextQueue();
    spawnNextPiece();


    gameOverlay.classList.add(
        "is-hidden"
    );


    startButton.textContent =
        "다시 시작";

    pauseButton.textContent =
        "일시정지";

    pauseButton.disabled = false;

    statusText.textContent =
        "PLAY";


    updateHud();
    drawAll();


    animationId =
        requestAnimationFrame(gameLoop);

}


/* =========================
   게임 반복 실행
========================= */

function gameLoop(time = 0) {

    if (
        !isRunning ||
        isPaused ||
        isGameOver
    ) {
        return;
    }


    const deltaTime =
        time - lastTime;


    lastTime = time;

    dropCounter += deltaTime;


    if (
        dropCounter >= dropInterval
    ) {

        moveDown(false);

        dropCounter = 0;

    }


    drawAll();


    animationId =
        requestAnimationFrame(gameLoop);

}


/* =========================
   전체 화면 그리기
========================= */

function drawAll() {

    drawGameBoard();
    drawNextQueue();
    drawHoldPiece();

}


/* =========================
   게임판 그리기
========================= */

function drawGameBoard() {

    gameContext.clearRect(
        0,
        0,
        gameCanvas.width,
        gameCanvas.height
    );


    const backgroundGradient =
        gameContext.createLinearGradient(
            0,
            0,
            0,
            gameCanvas.height
        );


    backgroundGradient.addColorStop(
        0,
        "#11182f"
    );

    backgroundGradient.addColorStop(
        1,
        "#050816"
    );


    gameContext.fillStyle =
        backgroundGradient;


    gameContext.fillRect(
        0,
        0,
        gameCanvas.width,
        gameCanvas.height
    );


    drawBoardGrid();
    drawLockedBlocks();
    drawGhostPiece();


    if (currentPiece) {

        drawPiece(
            gameContext,
            currentPiece,
            BLOCK_SIZE,
            1
        );

    }

}


/* =========================
   게임판 격자
========================= */

function drawBoardGrid() {

    gameContext.save();


    gameContext.strokeStyle =
        "rgba(255, 255, 255, 0.07)";

    gameContext.lineWidth = 1;


    for (
        let x = 0;
        x <= COLS;
        x++
    ) {

        gameContext.beginPath();

        gameContext.moveTo(
            x * BLOCK_SIZE + 0.5,
            0
        );

        gameContext.lineTo(
            x * BLOCK_SIZE + 0.5,
            ROWS * BLOCK_SIZE
        );

        gameContext.stroke();

    }


    for (
        let y = 0;
        y <= ROWS;
        y++
    ) {

        gameContext.beginPath();

        gameContext.moveTo(
            0,
            y * BLOCK_SIZE + 0.5
        );

        gameContext.lineTo(
            COLS * BLOCK_SIZE,
            y * BLOCK_SIZE + 0.5
        );

        gameContext.stroke();

    }


    gameContext.restore();

}


/* =========================
   쌓인 블록 그리기
========================= */

function drawLockedBlocks() {

    board.forEach(
        (row, y) => {

            row.forEach(
                (color, x) => {

                    if (color) {

                        drawCell(
                            gameContext,
                            x,
                            y,
                            color,
                            BLOCK_SIZE,
                            1
                        );

                    }

                }
            );

        }
    );

}


/* =========================
   블록 모양 그리기
========================= */

function drawPiece(
    context,
    piece,
    blockSize,
    alpha = 1,
    offsetX = 0,
    offsetY = 0
) {

    piece.matrix.forEach(
        (row, matrixY) => {

            row.forEach(
                (value, matrixX) => {

                    if (!value) {
                        return;
                    }


                    drawCell(
                        context,

                        piece.x +
                        matrixX +
                        offsetX,

                        piece.y +
                        matrixY +
                        offsetY,

                        piece.color,

                        blockSize,

                        alpha
                    );

                }
            );

        }
    );

}


/* =========================
   블록 한 칸 그리기
========================= */

function drawCell(
    context,
    gridX,
    gridY,
    color,
    blockSize,
    alpha = 1
) {

    const x =
        gridX * blockSize;

    const y =
        gridY * blockSize;


    const gap =
        Math.max(
            2,
            blockSize * 0.08
        );


    context.save();

    context.globalAlpha = alpha;


    /* 블록 그림자 */

    context.fillStyle =
        "rgba(0, 0, 0, 0.45)";

    context.fillRect(
        x + gap + 2,
        y + gap + 3,

        blockSize - gap * 2,
        blockSize - gap * 2
    );


    /* 블록 그라데이션 */

    const gradient =
        context.createLinearGradient(
            x,
            y,
            x + blockSize,
            y + blockSize
        );


    gradient.addColorStop(
        0,
        lightenColor(color, 40)
    );

    gradient.addColorStop(
        0.5,
        color
    );

    gradient.addColorStop(
        1,
        darkenColor(color, 35)
    );


    context.fillStyle = gradient;


    context.fillRect(
        x + gap,
        y + gap,

        blockSize - gap * 2,
        blockSize - gap * 2
    );


    /* 블록 테두리 */

    context.strokeStyle =
        "rgba(255, 255, 255, 0.72)";

    context.lineWidth =
        Math.max(
            1,
            blockSize * 0.05
        );


    context.strokeRect(
        x + gap + 1,
        y + gap + 1,

        blockSize - gap * 2 - 2,
        blockSize - gap * 2 - 2
    );


    /* 블록 위쪽 빛 */

    context.fillStyle =
        "rgba(255, 255, 255, 0.32)";


    context.fillRect(
        x + gap + 3,
        y + gap + 3,

        blockSize - gap * 2 - 6,

        Math.max(
            2,
            blockSize * 0.11
        )
    );


    context.restore();

}


/* =========================
   색상을 밝게 만들기
========================= */

function lightenColor(
    hexColor,
    amount
) {

    return changeColor(
        hexColor,
        amount
    );

}


/* =========================
   색상을 어둡게 만들기
========================= */

function darkenColor(
    hexColor,
    amount
) {

    return changeColor(
        hexColor,
        -amount
    );

}


/* =========================
   색상 변경
========================= */

function changeColor(
    hexColor,
    amount
) {

    const value =
        parseInt(
            hexColor.replace("#", ""),
            16
        );


    const red =
        Math.max(
            0,
            Math.min(
                255,
                (value >> 16) + amount
            )
        );


    const green =
        Math.max(
            0,
            Math.min(
                255,
                (
                    (value >> 8) &
                    0x00ff
                ) + amount
            )
        );


    const blue =
        Math.max(
            0,
            Math.min(
                255,
                (
                    value &
                    0x0000ff
                ) + amount
            )
        );


    return `rgb(${red}, ${green}, ${blue})`;

}


/* =========================
   고스트 블록
========================= */

function drawGhostPiece() {

    if (!currentPiece) {
        return;
    }


    const ghostPiece = {

        ...currentPiece,

        matrix:
            currentPiece.matrix.map(
                row => [...row]
            )

    };


    while (
        !hasCollision(
            ghostPiece,
            0,
            1
        )
    ) {

        ghostPiece.y += 1;

    }


    drawPiece(
        gameContext,
        ghostPiece,
        BLOCK_SIZE,
        0.18
    );

}


/* =========================
   다음 블록 그리기
========================= */

function drawNextQueue() {

    nextContext.clearRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );


    nextContext.fillStyle =
        "#060a18";


    nextContext.fillRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );


    const previewTypes =
        nextQueue.slice(0, 4);


    previewTypes.forEach(
        (type, index) => {

            const piece =
                createPiece(type);


            const blockSize = 20;


            const matrixWidth =
                piece.matrix[0].length *
                blockSize;


            const matrixHeight =
                piece.matrix.length *
                blockSize;


            const centerX =
                (
                    nextCanvas.width -
                    matrixWidth
                ) / 2;


            const slotTop =
                index * 78;


            const centerY =
                slotTop +
                (
                    72 -
                    matrixHeight
                ) / 2;


            piece.x =
                centerX / blockSize;


            piece.y =
                centerY / blockSize;


            drawPiece(
                nextContext,
                piece,
                blockSize,
                1
            );


            if (
                index <
                previewTypes.length - 1
            ) {

                nextContext.strokeStyle =
                    "rgba(255, 255, 255, 0.16)";


                nextContext.setLineDash(
                    [4, 4]
                );


                nextContext.beginPath();


                nextContext.moveTo(
                    12,
                    slotTop + 77.5
                );


                nextContext.lineTo(
                    nextCanvas.width - 12,
                    slotTop + 77.5
                );


                nextContext.stroke();


                nextContext.setLineDash([]);

            }

        }
    );

}


/* =========================
   HOLD 블록 그리기
========================= */

function drawHoldPiece() {

    holdContext.clearRect(
        0,
        0,
        holdCanvas.width,
        holdCanvas.height
    );


    holdContext.fillStyle =
        "#060a18";


    holdContext.fillRect(
        0,
        0,
        holdCanvas.width,
        holdCanvas.height
    );


    if (!holdType) {

        holdContext.fillStyle =
            "rgba(255, 255, 255, 0.35)";


        holdContext.font =
            "bold 12px Courier New";


        holdContext.textAlign =
            "center";


        holdContext.fillText(
            "EMPTY",
            holdCanvas.width / 2,
            holdCanvas.height / 2 + 4
        );


        return;

    }


    const piece =
        createPiece(holdType);


    const blockSize = 22;


    const matrixWidth =
        piece.matrix[0].length *
        blockSize;


    const matrixHeight =
        piece.matrix.length *
        blockSize;


    piece.x =
        (
            holdCanvas.width -
            matrixWidth
        ) / 2 / blockSize;


    piece.y =
        (
            holdCanvas.height -
            matrixHeight
        ) / 2 / blockSize;


    drawPiece(
        holdContext,
        piece,
        blockSize,

        holdUsed
            ? 0.35
            : 1
    );

}


/* =========================
   충돌 검사
========================= */

function hasCollision(
    piece,
    offsetX = 0,
    offsetY = 0
) {

    return piece.matrix.some(
        (row, matrixY) => {

            return row.some(
                (value, matrixX) => {

                    if (!value) {
                        return false;
                    }


                    const boardX =
                        piece.x +
                        matrixX +
                        offsetX;


                    const boardY =
                        piece.y +
                        matrixY +
                        offsetY;


                    if (
                        boardX < 0 ||
                        boardX >= COLS ||
                        boardY >= ROWS
                    ) {

                        return true;

                    }


                    if (boardY < 0) {
                        return false;
                    }


                    return (
                        board[boardY][boardX]
                        !== null
                    );

                }
            );

        }
    );

}


/* =========================
   좌우 이동
========================= */

function moveHorizontal(direction) {

    if (!canControl()) {
        return;
    }


    if (
        !hasCollision(
            currentPiece,
            direction,
            0
        )
    ) {

        currentPiece.x += direction;

        drawAll();

    }

}


/* =========================
   아래로 이동
========================= */

function moveDown(manual = false) {

    if (!canControl()) {
        return;
    }


    if (
        !hasCollision(
            currentPiece,
            0,
            1
        )
    ) {

        currentPiece.y += 1;


        if (manual) {

            score += 1;

            updateHud();

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

    if (!canControl()) {
        return;
    }


    let distance = 0;


    while (
        !hasCollision(
            currentPiece,
            0,
            1
        )
    ) {

        currentPiece.y += 1;

        distance += 1;

    }


    score += distance * 2;


    lockPiece();


    dropCounter = 0;

}


/* =========================
   블록 회전
========================= */

function rotateCurrentPiece() {

    if (!canControl()) {
        return;
    }


    const originalMatrix =
        currentPiece.matrix.map(
            row => [...row]
        );


    const originalX =
        currentPiece.x;


    const originalY =
        currentPiece.y;


    currentPiece.matrix =
        rotateMatrix(
            currentPiece.matrix
        );


    /*
        벽에 붙어 있을 때 회전할 수 있도록
        좌우 위치를 조금씩 검사한다.
    */

    const kickTests = [

        [0, 0],
        [-1, 0],
        [1, 0],
        [-2, 0],
        [2, 0],
        [0, -1]

    ];


    for (
        const [
            offsetX,
            offsetY
        ] of kickTests
    ) {

        currentPiece.x =
            originalX + offsetX;


        currentPiece.y =
            originalY + offsetY;


        if (
            !hasCollision(currentPiece)
        ) {

            drawAll();

            return;

        }

    }


    /*
        회전할 공간이 없으면
        원래 모양으로 돌린다.
    */

    currentPiece.matrix =
        originalMatrix;


    currentPiece.x =
        originalX;


    currentPiece.y =
        originalY;

}


/* =========================
   행렬 90도 회전
========================= */

function rotateMatrix(matrix) {

    return matrix[0].map(
        (_, columnIndex) =>

            matrix
                .map(
                    row =>
                        row[columnIndex]
                )
                .reverse()

    );

}


/* =========================
   블록 HOLD
========================= */

function holdCurrentPiece() {

    if (
        !canControl() ||
        holdUsed
    ) {
        return;
    }


    const currentType =
        currentPiece.type;


    if (holdType === null) {

        holdType =
            currentType;


        spawnNextPiece();

    } else {

        const swapType =
            holdType;


        holdType =
            currentType;


        currentPiece =
            createPiece(swapType);


        pieceStatistics[swapType] += 1;


        if (
            hasCollision(currentPiece)
        ) {

            finishGame();

            return;

        }

    }


    holdUsed = true;


    updateHud();
    drawAll();

}


/* =========================
   블록 고정
========================= */

function lockPiece() {

    let lockedAboveBoard = false;


    currentPiece.matrix.forEach(
        (row, matrixY) => {

            row.forEach(
                (value, matrixX) => {

                    if (!value) {
                        return;
                    }


                    const boardX =
                        currentPiece.x +
                        matrixX;


                    const boardY =
                        currentPiece.y +
                        matrixY;


                    if (boardY < 0) {

                        lockedAboveBoard = true;

                        return;

                    }


                    board[boardY][boardX] =
                        currentPiece.color;

                }
            );

        }
    );


    if (lockedAboveBoard) {

        finishGame();

        return;

    }


    clearCompletedLines();

    spawnNextPiece();

    updateHud();

    drawAll();

}


/* =========================
   완성된 줄 삭제
========================= */

function clearCompletedLines() {

    let cleared = 0;


    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        const isFullLine =
            board[y].every(
                cell => cell !== null
            );


        if (isFullLine) {

            board.splice(y, 1);


            board.unshift(
                Array(COLS).fill(null)
            );


            cleared += 1;


            /*
                줄을 삭제하면 배열이 당겨지기 때문에
                같은 y 위치를 다시 확인한다.
            */

            y += 1;

        }

    }


    if (cleared === 0) {
        return;
    }


    const scoreTable = [
        0,
        100,
        300,
        500,
        800
    ];


    score +=
        scoreTable[cleared] *
        level;


    lines += cleared;


    level =
        Math.floor(lines / 10) + 1;


    /*
        레벨이 올라가면
        블록이 빨라진다.
    */

    dropInterval =
        Math.max(
            90,
            850 -
            (level - 1) * 65
        );


    updateHighScore();

}


/* =========================
   일시정지
========================= */

function togglePause() {

    if (
        !isRunning ||
        isGameOver
    ) {
        return;
    }


    isPaused = !isPaused;


    if (isPaused) {

        cancelAnimationFrame(
            animationId
        );


        pauseButton.textContent =
            "계속하기";


        statusText.textContent =
            "PAUSE";


        overlayTitle.textContent =
            "PAUSED";


        overlayText.textContent =
            "잠시 멈췄습니다. 계속하기 버튼을 누르세요.";


        overlayButton.textContent =
            "CONTINUE";


        gameOverlay.classList.remove(
            "is-hidden"
        );

    } else {

        pauseButton.textContent =
            "일시정지";


        statusText.textContent =
            "PLAY";


        gameOverlay.classList.add(
            "is-hidden"
        );


        lastTime =
            performance.now();


        animationId =
            requestAnimationFrame(
                gameLoop
            );

    }

}


/* =========================
   게임 종료
========================= */

function finishGame() {

    isRunning = false;
    isPaused = false;
    isGameOver = true;


    cancelAnimationFrame(
        animationId
    );


    updateHighScore();
    updateHud();


    statusText.textContent =
        "OVER";


    pauseButton.disabled = true;


    overlayTitle.textContent =
        "GAME OVER";


    overlayText.textContent =
        `최종 점수 ${formatNumber(score, 7)}점. 다시 도전하세요.`;


    overlayButton.textContent =
        "RETRY";


    gameOverlay.classList.remove(
        "is-hidden"
    );

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
        "arcadeTetrisHighScore",
        String(highScore)
    );

}


/* =========================
   화면 정보 업데이트
========================= */

function updateHud() {

    updateHighScore();


    scoreElement.textContent =
        formatNumber(score, 7);


    highScoreElement.textContent =
        formatNumber(highScore, 7);


    levelElement.textContent =
        formatNumber(level, 2);


    linesElement.textContent =
        formatNumber(lines, 3);


    linesTopElement.textContent =
        formatNumber(lines, 3);


    /*
        10줄마다 레벨이 올라가므로
        현재 진행도를 표시한다.
    */

    const progressPercent =
        (lines % 10) * 10;


    levelProgress.style.width =
        `${progressPercent}%`;


    /*
        위쪽 HP는 장식용이지만
        플레이 진행에 따라 조금씩 변한다.
    */

    const hpPercent =
        Math.max(
            10,
            100 - Math.floor(lines / 2)
        );


    playerHp.style.width =
        `${hpPercent}%`;


    statisticElements.forEach(
        element => {

            const type =
                element.dataset.stat;


            element.textContent =
                formatNumber(
                    pieceStatistics[type],
                    3
                );

        }
    );

}


/* =========================
   숫자 앞에 0 추가
========================= */

function formatNumber(
    value,
    digits
) {

    return String(value).padStart(
        digits,
        "0"
    );

}


/* =========================
   조작 가능한 상태 확인
========================= */

function canControl() {

    return (
        isRunning &&
        !isPaused &&
        !isGameOver &&
        currentPiece !== null
    );

}


/* =========================
   화면 버튼 조작
========================= */

function handleAction(action) {

    switch (action) {

        case "left":

            moveHorizontal(-1);

            break;


        case "right":

            moveHorizontal(1);

            break;


        case "down":

            moveDown(true);

            break;


        case "rotate":

            rotateCurrentPiece();

            break;


        case "drop":

            hardDrop();

            break;


        default:

            break;

    }

}


/* =========================
   키보드 조작
========================= */

document.addEventListener(
    "keydown",
    event => {

        const blockedCodes = [
            "ArrowLeft",
            "ArrowRight",
            "ArrowDown",
            "ArrowUp",
            "Space"
        ];


        /*
            방향키나 스페이스바를 눌렀을 때
            웹페이지가 움직이지 않도록 막는다.
        */

        if (
            blockedCodes.includes(
                event.code
            )
        ) {

            event.preventDefault();

        }


        switch (event.code) {

            case "ArrowLeft":

                moveHorizontal(-1);

                break;


            case "ArrowRight":

                moveHorizontal(1);

                break;


            case "ArrowDown":

                moveDown(true);

                break;


            case "ArrowUp":

                rotateCurrentPiece();

                break;


            case "Space":

                hardDrop();

                break;


            case "KeyC":

                holdCurrentPiece();

                break;


            case "KeyP":

            case "Escape":

                togglePause();

                break;


            default:

                break;

        }

    }
);


/* =========================
   화면 조작 버튼 이벤트
========================= */

mobileControlButtons.forEach(
    button => {

        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();


                handleAction(
                    button.dataset.action
                );

            }
        );

    }
);


/* =========================
   시작 버튼
========================= */

startButton.addEventListener(
    "click",
    startGame
);


/* =========================
   일시정지 버튼
========================= */

pauseButton.addEventListener(
    "click",
    togglePause
);


/* =========================
   오버레이 버튼
========================= */

overlayButton.addEventListener(
    "click",
    () => {

        if (
            isPaused &&
            !isGameOver
        ) {

            togglePause();

        } else {

            startGame();

        }

    }
);


/* =========================
   브라우저를 벗어나면 정지
========================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            isRunning &&
            !isPaused &&
            !isGameOver
        ) {

            togglePause();

        }

    }
);


/* =========================
   최초 화면 출력
========================= */

highScoreElement.textContent =
    formatNumber(
        highScore,
        7
    );


updateHud();
drawAll();