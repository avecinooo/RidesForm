// ==========================================
// GENERAL GAME SETUP
// ==========================================

const roomNames = {
    1: "DISC MEMORY",
    2: "SIMON SAYS",
    3: "TEAM CONNECTIONS",
    4: "THE CHASE"
};

let roomTimes = JSON.parse(sessionStorage.getItem("roomTimes")) || {};

let currentRoom = null;
let roomStartTime = null;
let timerInterval = null;

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    return (
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(milliseconds).padStart(3, "0")
    );
}

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


// ==========================================
// ENTERING AND LEAVING ROOMS
// ==========================================

function enterRoom(roomNumber) {
    if (roomTimes[roomNumber] !== undefined) return;
    if (currentRoom !== null) return;

    currentRoom = roomNumber;
    roomStartTime = Date.now();

    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("room-screen").classList.remove("hidden");

    document.getElementById("room-title").textContent =
        "ROOM 0" + roomNumber + ": " + roomNames[roomNumber];

    document.getElementById("room-subtitle").textContent =
        "Complete the challenge to move forward.";

    document.getElementById("room-timer").textContent = "00:00.000";

    if (roomNumber === 1) {
        initializeDiscMemory();
    } else if (roomNumber === 2) {
        initializeSimonSays();
    } else {
        document.getElementById("room-content").innerHTML =
            "<h2>CHALLENGE COMING SOON</h2>";
    }

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - roomStartTime;
        document.getElementById("room-timer").textContent =
            formatTime(elapsed);
    }, 20);
}


function completeRoom() {
    if (currentRoom === null) return;

    const elapsed = Date.now() - roomStartTime;

    roomTimes[currentRoom] = elapsed;
    sessionStorage.setItem("roomTimes", JSON.stringify(roomTimes));

    clearInterval(timerInterval);
    timerInterval = null;

    currentRoom = null;
    roomStartTime = null;

    updateMenu();
    returnToMenu();
}


function returnToMenu() {
    if (currentRoom !== null) {
        alert("Finish the challenge before returning to the menu!");
        return;
    }

    document.getElementById("room-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");
}


// ==========================================
// ROOM 01: DISC MEMORY
// ==========================================

function initializeDiscMemory() {
    const roomContent = document.getElementById("room-content");

    const words = [
        "HANDLER",
        "CUTTER",
        "HAMMER",
        "FLICK",
        "BACKHAND",
        "CHEEKS",
        "BURN",
        "BOX"
    ];

    let cards = shuffleArray([...words, ...words]);

    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let lockBoard = false;

    roomContent.innerHTML = `
        <div class="memory-instructions">
            Turn over the discs and match all eight pairs.
        </div>

        <div class="memory-stats">
            <div>PAIRS: <strong id="memory-pairs">0 / 8</strong></div>
            <div>MOVES: <strong id="memory-moves">0</strong></div>
        </div>

        <div class="memory-grid" id="memory-grid"></div>
    `;

    const grid = document.getElementById("memory-grid");

    cards.forEach((word) => {
        const card = document.createElement("button");

        card.className = "memory-card";
        card.textContent = "?";
        card.dataset.word = word;

        card.addEventListener("click", () => {
            if (lockBoard) return;
            if (card.classList.contains("matched")) return;
            if (card.classList.contains("flipped")) return;

            card.classList.add("flipped");
            card.textContent = word;

            flippedCards.push(card);

            if (flippedCards.length === 2) {
                moves++;
                document.getElementById("memory-moves").textContent = moves;

                const [first, second] = flippedCards;

                if (first.dataset.word === second.dataset.word) {
                    first.classList.add("matched");
                    second.classList.add("matched");

                    first.disabled = true;
                    second.disabled = true;

                    matchedPairs++;
                    document.getElementById("memory-pairs").textContent =
                        matchedPairs + " / 8";

                    flippedCards = [];

                    if (matchedPairs === 8) {
                        roomContent.innerHTML = `
                            <h2 class="memory-complete">
                                ROOM 01 COMPLETE!
                            </h2>
                            <p>All eight pairs matched.</p>
                        `;

                        setTimeout(completeRoom, 700);
                    }
                } else {
                    lockBoard = true;

                    setTimeout(() => {
                        first.classList.remove("flipped");
                        second.classList.remove("flipped");

                        first.textContent = "?";
                        second.textContent = "?";

                        flippedCards = [];
                        lockBoard = false;
                    }, 800);
                }
            }
        });

        grid.appendChild(card);
    });
}


// ==========================================
// ROOM 02: SIMON SAYS
// ==========================================

function initializeSimonSays() {
    const roomContent = document.getElementById("room-content");

    const actions = ["CUT", "DUMP", "SWING", "HUCK"];

    let sequence = [];
    let currentRound = 1;
    let playerPosition = 0;
    let mistakes = 0;
    let acceptingInput = false;
    let playbackTimeouts = [];

    roomContent.innerHTML = `
        <div class="simon-panel">

            <div class="simon-round" id="simon-round">
                ROUND 1 / 7
            </div>

            <p class="simon-instructions">
                Watch the sequence carefully.
                Then repeat it in the exact same order.
                Each round adds one new action.
            </p>

            <div class="simon-status" id="simon-status">
                Press START to begin.
            </div>

            <div class="simon-grid">
                <button class="simon-button"
                    data-action="CUT" disabled>CUT</button>

                <button class="simon-button"
                    data-action="DUMP" disabled>DUMP</button>

                <button class="simon-button"
                    data-action="SWING" disabled>SWING</button>

                <button class="simon-button"
                    data-action="HUCK" disabled>HUCK</button>
            </div>

            <div class="simon-progress">
                SEQUENCE: <strong id="simon-progress">0 / 1</strong>
            </div>

            <p class="simon-progress">
                MISTAKES: <strong id="simon-mistakes">0</strong>
            </p>

            <button class="simon-start" id="simon-start">
                START
            </button>

        </div>
    `;

    const buttons = [...roomContent.querySelectorAll(".simon-button")];
    const startButton = document.getElementById("simon-start");

    const status = document.getElementById("simon-status");
    const roundDisplay = document.getElementById("simon-round");
    const progressDisplay = document.getElementById("simon-progress");
    const mistakesDisplay = document.getElementById("simon-mistakes");

    // Add one new random action to the sequence.
    function addToSequence() {
        const randomAction =
            actions[Math.floor(Math.random() * actions.length)];

        sequence.push(randomAction);
    }

    // Turn off all buttons and clear any previous flashes.
    function clearLights() {
        buttons.forEach(button => button.classList.remove("lit"));
    }

    // Cancel any pending playback animations.
    function clearPlayback() {
        playbackTimeouts.forEach(timeout => clearTimeout(timeout));
        playbackTimeouts = [];
        clearLights();
    }

    // Flash a specific action.
    function flashAction(action, duration) {
        const button = buttons.find(
            button => button.dataset.action === action
        );

        if (!button) return;

        button.classList.add("lit");

        const timeout = setTimeout(() => {
            button.classList.remove("lit");
        }, duration);

        playbackTimeouts.push(timeout);
    }

    // Play the full sequence for the current round.
    function playSequence() {
        acceptingInput = false;
        playerPosition = 0;

        buttons.forEach(button => button.disabled = true);

        startButton.disabled = true;
        startButton.textContent = "WATCH";

        status.textContent = "WATCH THE SEQUENCE...";
        progressDisplay.textContent = "0 / " + sequence.length;

        clearPlayback();

        const flashDuration = Math.max(260, 650 - currentRound * 45);
        const gapDuration = Math.max(140, 260 - currentRound * 15);
        const stepDuration = flashDuration + gapDuration;

        sequence.forEach((action, index) => {
            const timeout = setTimeout(() => {
                flashAction(action, flashDuration);
            }, 500 + index * stepDuration);

            playbackTimeouts.push(timeout);
        });

        const finishTimeout = setTimeout(() => {
            clearLights();

            acceptingInput = true;

            buttons.forEach(button => button.disabled = false);

            startButton.disabled = false;
            startButton.textContent = "REPLAY SEQUENCE";

            status.textContent = "YOUR TURN! REPEAT THE SEQUENCE.";
        }, 500 + sequence.length * stepDuration);

        playbackTimeouts.push(finishTimeout);
    }

    // Handle the player's button selection.
    function handlePlayerInput(action) {
        if (!acceptingInput) return;

        acceptingInput = false;

        flashAction(action, 180);

        if (action === sequence[playerPosition]) {
            playerPosition++;

            progressDisplay.textContent =
                playerPosition + " / " + sequence.length;

            if (playerPosition === sequence.length) {
                buttons.forEach(button => button.disabled = true);
                startButton.disabled = true;

                if (currentRound === 7) {
                    status.textContent = "ALL SEVEN ROUNDS COMPLETE!";

                    roomContent.querySelector(".simon-panel").innerHTML = `
                        <h2 class="memory-complete">
                            ROOM 02 COMPLETE!
                        </h2>
                        <p>You successfully completed all seven rounds.</p>
                    `;

                    setTimeout(completeRoom, 700);
                    return;
                }

                status.textContent = "ROUND COMPLETE!";

                currentRound++;
                addToSequence();

                roundDisplay.textContent =
                    "ROUND " + currentRound + " / 7";

                startButton.textContent = "NEXT ROUND";
                startButton.disabled = false;

                status.textContent = "GET READY FOR THE NEXT ROUND.";
                progressDisplay.textContent =
                    "0 / " + sequence.length;

                startButton.onclick = () => {
                    startButton.onclick = null;
                    playSequence();
                };

                return;
            }

            // Allow the next selection.
            acceptingInput = true;

        } else {
            mistakes++;
            mistakesDisplay.textContent = mistakes;

            status.textContent = "WRONG ACTION! WATCH AGAIN.";

            buttons.forEach(button => button.disabled = true);

            const retryTimeout = setTimeout(() => {
                playSequence();
            }, 900);

            playbackTimeouts.push(retryTimeout);
        }
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            handlePlayerInput(button.dataset.action);
        });
    });

    // Begin the first round.
    startButton.addEventListener("click", () => {
        if (sequence.length === 0) {
            addToSequence();
        }

        playSequence();
    });
}


// ==========================================
// MENU AND RESULTS
// ==========================================

function updateMenu() {
    let totalTime = 0;

    for (let i = 1; i <= 4; i++) {
        const button = document.getElementById("room-button-" + i);
        const status = document.getElementById("status-" + i);

        if (roomTimes[i] !== undefined) {
            button.disabled = true;
            status.textContent = formatTime(roomTimes[i]);
            totalTime += roomTimes[i];
        } else {
            button.disabled = false;
            status.textContent = "Not completed";
        }
    }

    document.getElementById("total-time").textContent =
        formatTime(totalTime);

    const allComplete = [1, 2, 3, 4].every(
        room => roomTimes[room] !== undefined
    );

    document.getElementById("escape-button").disabled = !allComplete;
}


function showResults() {
    const allComplete = [1, 2, 3, 4].every(
        room => roomTimes[room] !== undefined
    );

    if (!allComplete) return;

    let totalTime = 0;
    let resultsHTML = "";

    for (let i = 1; i <= 4; i++) {
        totalTime += roomTimes[i];

        resultsHTML += `
            <div class="result-row">
                <span>ROOM 0${i}: ${roomNames[i]}</span>
                <strong>${formatTime(roomTimes[i])}</strong>
            </div>
        `;
    }

    document.getElementById("final-time").textContent =
        formatTime(totalTime);

    document.getElementById("results-list").innerHTML = resultsHTML;

    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("room-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.remove("hidden");
}


// ==========================================
// INSTRUCTIONS
// ==========================================

function showInstructions() {
    document.getElementById("instructions-modal").classList.remove("hidden");
}

function hideInstructions() {
    document.getElementById("instructions-modal").classList.add("hidden");
}


// ==========================================
// INITIALIZE
// ==========================================

updateMenu();
