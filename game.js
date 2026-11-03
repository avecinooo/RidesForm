
let playerName = "";
let puzzleStartTime = 0;
let puzzleTimer = null;
let elapsedSeconds = 0;

let tiles = [];
let selectedTiles = [];
let matchedPairs = 0;
let moves = 0;
let lockBoard = false;

const symbols = ["👟", "🎒", "🏆", "⚡", "🧢", "📋", "🔑", "🥏"];

function startGame() {
    const nameInput = document.getElementById("playerName");

    playerName = nameInput.value.trim();

    if (!playerName) {
        alert("Enter your name before starting!");
        return;
    }

    localStorage.setItem("playerName", playerName);
    loadRoomOne();
}

function loadRoomOne() {
    clearInterval(puzzleTimer);

    matchedPairs = 0;
    moves = 0;
    selectedTiles = [];
    lockBoard = false;
    elapsedSeconds = 0;

    // Create two copies of each symbol
    tiles = [...symbols, ...symbols];

    // Shuffle the tiles
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    puzzleStartTime = Date.now();

    document.querySelector(".container").innerHTML = `
        <div class="room-header">
            <h1>ROOM 01: THE EQUIPMENT CLOSET</h1>
            <p>Find all eight matching pairs to unlock the exit.</p>
        </div>

        <div class="game-info">
            <div>
                <span class="info-label">PLAYER</span>
                <strong>${escapeHTML(playerName)}</strong>
            </div>

            <div>
                <span class="info-label">TIME</span>
                <strong id="timer">00:00</strong>
            </div>

            <div>
                <span class="info-label">MOVES</span>
                <strong id="moves">0</strong>
            </div>

            <div>
                <span class="info-label">MATCHES</span>
                <strong id="matches">0 / 8</strong>
            </div>
        </div>

        <div class="memory-instructions">
            <h2>THE CHALLENGE</h2>
            <p>
                The equipment closet has been scrambled.
                Flip over two frisbees at a time and find all
                eight matching pairs. Remember where each
                symbol is hidden. The fewer moves you make,
                the better your score.
            </p>
        </div>

        <div class="memory-board" id="memoryBoard"></div>

        <div class="memory-footer">
            <p id="gameMessage">Find your first matching pair.</p>
        </div>

        <div class="modal" id="completionModal">
            <div class="modal-content">
                <h2>ROOM 01 COMPLETE!</h2>
                <p>You successfully matched every frisbee.</p>

                <div class="completion-stats">
                    <p>Time: <strong id="finalTime"></strong></p>
                    <p>Moves: <strong id="finalMoves"></strong></p>
                </div>

                <p class="unlock-message">
                    Your next room's access code is:
                </p>

                <div class="unlock-code">7429</div>

                <button onclick="continueGame()">
                    CONTINUE TO ROOM 02
                </button>
            </div>
        </div>
    `;

    renderTiles();

    puzzleTimer = setInterval(updateTimer, 1000);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderTiles() {
    const board = document.getElementById("memoryBoard");

    board.innerHTML = "";

    tiles.forEach((symbol, index) => {
        const tile = document.createElement("button");

        tile.className = "memory-tile";
        tile.id = `tile-${index}`;
        tile.type = "button";
        tile.setAttribute("aria-label", `Hidden frisbee ${index + 1}`);
        tile.innerHTML = `<span class="tile-back">🥏</span>
                          <span class="tile-front">${symbol}</span>`;

        tile.addEventListener("click", () => flipTile(index));

        board.appendChild(tile);
    });
}

function flipTile(index) {
    if (lockBoard) return;
    if (selectedTiles.includes(index)) return;

    const tile = document.getElementById(`tile-${index}`);

    if (tile.classList.contains("matched")) return;

    tile.classList.add("flipped");
    selectedTiles.push(index);

    if (selectedTiles.length === 2) {
        moves++;
        document.getElementById("moves").textContent = moves;

        checkMatch();
    }
}

function checkMatch() {
    const [first, second] = selectedTiles;

    if (tiles[first] === tiles[second]) {
        // Correct match
        document.getElementById(`tile-${first}`).classList.add("matched");
        document.getElementById(`tile-${second}`).classList.add("matched");

        matchedPairs++;

        document.getElementById("matches").textContent =
            `${matchedPairs} / 8`;

        document.getElementById("gameMessage").textContent =
            "Nice match! Keep going.";

        selectedTiles = [];

        if (matchedPairs === 8) {
            completePuzzle();
        }

    } else {
        // Incorrect match: flip both tiles back over
        lockBoard = true;

        document.getElementById("gameMessage").textContent =
            "Not a match. Remember their locations!";

        setTimeout(() => {
            document.getElementById(`tile-${first}`).classList.remove("flipped");
            document.getElementById(`tile-${second}`).classList.remove("flipped");

            selectedTiles = [];
            lockBoard = false;

            document.getElementById("gameMessage").textContent =
                "Try another pair.";
        }, 900);
    }
}

function updateTimer() {
    elapsedSeconds = Math.floor((Date.now() - puzzleStartTime) / 1000);

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    document.getElementById("timer").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function completePuzzle() {
    clearInterval(puzzleTimer);

    elapsedSeconds = Math.floor((Date.now() - puzzleStartTime) / 1000);

    localStorage.setItem("room1Time", elapsedSeconds);
    localStorage.setItem("room1Moves", moves);

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    document.getElementById("finalTime").textContent =
        `${minutes}:${String(seconds).padStart(2, "0")}`;

    document.getElementById("finalMoves").textContent = moves;

    document.getElementById("gameMessage").textContent =
        "All eight pairs found!";

    document.getElementById("completionModal").style.display = "flex";
}

function continueGame() {
    alert("Room 02 is coming next! Your code is 7429.");
}
