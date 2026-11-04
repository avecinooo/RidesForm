
const roomNames = {
    1: "DISC MEMORY",
    2: "SIMON SAYS",
    3: "TEAM CONNECTIONS",
    4: "THE CHASE"
};

let roomTimes = JSON.parse(
    sessionStorage.getItem("roomTimes")
) || {};

let currentRoom = null;
let roomStartTime = null;
let timerInterval = null;

// Format milliseconds into MM:SS.mmm
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

// Enter a room
function enterRoom(roomNumber) {
    if (roomTimes[roomNumber] !== undefined) {
        alert("You have already completed this room!");
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

    document.getElementById("room-content").innerHTML =
        "<p>Your challenge will appear here.</p>";

    document.getElementById("complete-button").classList.remove("hidden");

    // Start the stopwatch
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - roomStartTime;

        document.getElementById("room-timer").textContent =
            formatTime(elapsed);
    }, 30);
}

// Complete current room
function completeRoom() {
    if (currentRoom === null) return;

    const elapsed = Date.now() - roomStartTime;

    // Save the room time
    roomTimes[currentRoom] = elapsed;

    sessionStorage.setItem(
        "roomTimes",
        JSON.stringify(roomTimes)
    );

    clearInterval(timerInterval);

    currentRoom = null;

    updateMenu();

    // Check whether all rooms are complete
    if (Object.keys(roomTimes).length === 4) {
        showResults();
    } else {
        returnToMenu();
    }
}

// Return to room selection
function returnToMenu() {
    clearInterval(timerInterval);

    document.getElementById("room-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");

    updateMenu();
}

// Update room completion statuses and total time
function updateMenu() {
    let totalTime = 0;

    for (let i = 1; i <= 4; i++) {
        const status = document.getElementById("status-" + i);
        const button = document.querySelector(
            `.room-button[onclick="enterRoom(${i})"]`
        );

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

    Object.values(roomTimes).forEach(time => {
        totalTime += time;
    });

    document.getElementById("total-time").textContent =
        formatTime(totalTime);
}

// Show final results
function showResults() {
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

// Instructions popup
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

// Load saved progress when the page opens
updateMenu();

if (Object.keys(roomTimes).length === 4) {
    showResults();
}
