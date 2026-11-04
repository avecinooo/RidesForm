
const roomNames = {
    1: "DISC MEMORY",
    2: "SIMON SAYS",
    3: "TEAM CONNECTIONS",
    4: "THE CHASE"
};

// Load saved room times
let roomTimes = JSON.parse(
    sessionStorage.getItem("roomTimes")
) || {};

let currentRoom = null;
let roomStartTime = null;
let timerInterval = null;


// FORMAT TIME
function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor(milliseconds % 1000);

    return (
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(ms).padStart(3, "0")
    );
}


// SHUFFLE ARRAY
function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


// ENTER A ROOM
function enterRoom(roomNumber) {

    // Prevent replaying completed rooms
    if (roomTimes[roomNumber] !== undefined) {
        return;
    }

    // Don't allow switching rooms during an active challenge
    if (currentRoom !== null) {
        return;
    }

    currentRoom = roomNumber;
    roomStartTime = Date.now();

    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("room-screen").classList.remove("hidden");

    document.getElementById("room-label").textContent =
        "ROOM " + String(roomNumber).padStart(2, "0");

    document.getElementById("room-title").textContent =
        roomNames[roomNumber];

    document.getElementById("room-timer").textContent =
        "00:00.000";

    // Load the correct game
    if (roomNumber === 1) {
        initializeDiscMemory();
    } else {
        document.getElementById("room-content").innerHTML =
            "<p>This challenge is coming soon!</p>";
    }

    // Start stopwatch
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - roomStartTime;

        document.getElementById("room-timer").textContent =
            formatTime(elapsed);

    }, 30);
}


// ==========================================
// ROOM 1: DISC MEMORY
// ==========================================

function initializeDiscMemory() {

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

    // Create two copies of every word
    const cards = shuffleArray([...words, ...words]);

    let firstCard = null;
    let secondCard = null;

    let lockBoard = false;
    let matches = 0;
    let moves = 0;

    const roomContent = document.getElementById("room-content");

    // Create game layout
    roomContent.innerHTML = `
        <p class="memory-instructions">
            Turn over two boxes at a time.
            Find all eight matching pairs to escape the room!
        </p>

        <div class="memory-stats">
            <span>MATCHES: <span id="match-count">0 / 8</span></span>
            <span>MOVES: <span id="move-count">0</span></span>
        </div>

        <div class="memory-grid" id="memory-grid"></div>
    `;

    const memoryGrid = document.getElementById("memory-grid");

    // Generate all 16 cards
    cards.forEach((word, index) => {

        const card = document.createElement("button");

        card.className = "memory-card";
        card.dataset.word = word;

        card.innerHTML = `
            <span class="card-back">?</span>
            <span class="card-word">${word}</span>
        `;

        card.addEventListener("click", () => {
            flipCard(card);
        });

        memoryGrid.appendChild(card);
    });


    // FLIP A CARD
    function flipCard(card) {

        // Ignore clicks if the board is locked
        if (lockBoard) return;

        // Ignore already flipped or matched cards
        if (
            card.classList.contains("flipped") ||
            card.classList.contains("matched")
        ) {
            return;
        }

        card.classList.add("flipped");

        // First card selected
        if (firstCard === null) {
            firstCard = card;
            return;
        }

        // Second card selected
        secondCard = card;

        moves++;

        document.getElementById("move-count").textContent =
            moves;

        checkMatch();
    }


    // CHECK WHETHER TWO CARDS MATCH
    function checkMatch() {

        const isMatch =
            firstCard.dataset.word === secondCard.dataset.word;

        if (isMatch) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }


    // CORRECT MATCH
    function handleMatch() {

        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.disabled = true;
        secondCard.disabled = true;

        matches++;

        document.getElementById("match-count").textContent =
            matches + " / 8";

        resetTurn();

        // Check whether all eight pairs are matched
        if (matches === 8) {
            finishDiscMemory();
        }
    }


    // INCORRECT MATCH
    function handleMismatch() {

        lockBoard = true;

        setTimeout(() => {

            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            resetTurn();

        }, 800);
    }


    // RESET TURN
    function resetTurn() {

        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }


    // COMPLETE THE GAME
    function finishDiscMemory() {

        roomContent.innerHTML = `
            <div class="memory-complete">
                <h2>ROOM 01 COMPLETE!</h2>
                <p>You successfully matched every disc term.</p>
                <p>Moves: ${moves}</p>
                <p>Returning to room selection...</p>
            </div>
        `;

        // Automatically stop the timer and save the score
        completeRoom();
    }
}


// ==========================================
// COMPLETE A ROOM
// ==========================================

function completeRoom() {

    if (currentRoom === null) return;

    const elapsed = Date.now() - roomStartTime;

    // Save room time
    roomTimes[currentRoom] = elapsed;

    sessionStorage.setItem(
        "roomTimes",
        JSON.stringify(roomTimes)
    );

    clearInterval(timerInterval);

    currentRoom = null;
    roomStartTime = null;

    updateMenu();
    returnToMenu();
}


// ==========================================
// RETURN TO MENU
// ==========================================

function returnToMenu() {

    // Don't allow players to abandon an unfinished challenge
    if (currentRoom !== null) {
        alert("Finish the challenge before returning to the menu!");
        return;
    }

    clearInterval(timerInterval);

    document.getElementById("room-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");

    updateMenu();
}


// ==========================================
// UPDATE MENU AND ESCAPE BUTTON
// ==========================================

function updateMenu() {

    let totalTime = 0;

    for (let i = 1; i <= 4; i++) {

        const status = document.getElementById("status-" + i);
        const button = document.getElementById("room-button-" + i);

        if (roomTimes[i] !== undefined) {

            status.textContent = formatTime(roomTimes[i]);
            status.classList.add("completed");
            button.disabled = true;

        } else {

            status.textContent = "NOT STARTED";
            status.classList.remove("completed");
            button.disabled = false;

        }
    }

    // Calculate overall time
    Object.values(roomTimes).forEach(time => {
        totalTime += time;
    });

    document.getElementById("total-time").textContent =
        formatTime(totalTime);

    // Check if all rooms are complete
    const allComplete = [1, 2, 3, 4].every(
        room => roomTimes[room] !== undefined
    );

    // Unlock ESCAPE
    document.getElementById("escape-button").disabled =
        !allComplete;
}


// ==========================================
// SHOW FINAL RESULTS
// ==========================================

function showResults() {

    const allComplete = [1, 2, 3, 4].every(
        room => roomTimes[room] !== undefined
    );

    if (!allComplete) return;

    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("room-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.remove("hidden");

    const resultsList = document.getElementById("results-list");

    resultsList.innerHTML = "";

    let totalTime = 0;

    for (let i = 1; i <= 4; i++) {

        const time = roomTimes[i];

        totalTime += time;

        resultsList.innerHTML += `
            <div class="result-row">
                <span>${roomNames[i]}</span>
                <strong>${formatTime(time)}</strong>
            </div>
        `;
    }

    document.getElementById("final-time").textContent =
        formatTime(totalTime);
}


// ==========================================
// INSTRUCTIONS POPUP
// ==========================================

document.getElementById("instructions-button")
    .addEventListener("click", () => {

        document.getElementById("instructions-modal")
            .classList.remove("hidden");

    });

document.getElementById("close-instructions")
    .addEventListener("click", () => {

        document.getElementById("instructions-modal")
            .classList.add("hidden");

    });


// ==========================================
// INITIALIZE MENU
// ==========================================

updateMenu();
