const canvas = document.querySelector('#tetris');
const context = canvas.getContext('2d');
const board = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    isPlaying: false,
}
const colors = [null, 'red', 'blue', 'violet', 'green', 'purple', 'orange', 'pink'];

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let pieces = ['I', 'L', 'J', 'O', 'T', 'S', 'Z'];
let animation;

context.scale(20, 20);

function init() {
    board.forEach(row => row.fill(0));
    dropCounter = 0;
    dropInterval = 1000;
    lastTime = 0;
    pieces = ['I', 'L', 'J', 'O', 'T', 'S', 'Z'];
    player.score = 0;
}

function gameStart() {
    init();
    updateScore();
    playerReset();
    player.isPlaying = true;
    update();
}

function gameOver() {
    player.isPlaying = false;
    cancelAnimationFrame(animation);
    alert('GAME OVER, your score is: ' + player.score);
}

function collide(board, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) return true;
        }
    }

    return false;
}

function breakLine() {
    let rowCount = 1;

    outer: for (let y = board.length - 1; y > 0; y--) {
        for (let x = 0; x < board.length; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++;

        dropInterval *= 0.95;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }

    return matrix;
}

function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2]
            ];
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        default:
            alert('An error has been occurred.');
            gameOver();
            return null;
    }
}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(board, { x: 0, y: 0 })
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        breakLine();
        updateScore();
        playerReset();
    }
    dropCounter = 0;
}

function playerDropImmediately() {
    while (!collide(board, player)) {
        player.pos.y++;
    }

    player.pos.y--;
    merge(board, player);
    breakLine();
    updateScore();
    playerReset();
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    if (pieces.length === 0) pieces = ['I', 'L', 'J', 'O', 'T', 'S', 'Z'];

    let next = pieces.length * Math.random() | 0;
    player.matrix = createPiece(pieces.splice(next, 1)[0]);
    
    player.pos.y = 0;
    player.pos.x = (board[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(board, player)) {
        gameOver();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;

    rotate(player.matrix, dir);

    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [ matrix[x][y], matrix[y][x] ] = [ matrix[y][x], matrix[x][y] ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse;
    }
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    animation = requestAnimationFrame(update);
}

function updateScore() {
    document.querySelector('#score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (player.isPlaying) {
        if (event.keyCode === 37) {         // left arrow
            playerMove(-1);
        } else if (event.keyCode === 39) {  // right arrow
            playerMove(1);
        } else if (event.keyCode === 40) {  // down arrow
            playerDrop();
        } else if (event.keyCode === 38) {  // up arrow
            playerRotate(1);
        } else if (event.keyCode === 32) {  // spacebar
            playerDropImmediately();
        }
    } else if (!player.isPlaying && event.keyCode === 13) {
        gameStart();
    }
});

updateScore();

// MAKE IT FURTHER
// 1) Combo Streak
// 2) Swapping