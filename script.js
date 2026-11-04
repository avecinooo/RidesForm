
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


// ENTER A ROOM
function enterRoom(roomNumber) {

    // Prevent replaying completed rooms
    if (roomTimes[roomNumber] !== undefined) {
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

    document.getElementById("room-timer").textContent =
        "00:00.000";

    // Start stopwatch
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        const elapsed = Date.now() - roomStartTime;

        document.getElementById("room-timer").textContent =
            formatTime(elapsed);

    }, 30);
}


// COMPLETE A ROOM
// Each actual game will call this function when solved.
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

    updateMenu();
    returnToMenu();
}


// RETURN TO MENU
function returnToMenu() {

    clearInterval(timerInterval);

    document.getElementById("room-screen").classList.add("hidden");
    document.getElementById("results-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");

    updateMenu();
}


// UPDATE MENU AND ESCAPE BUTTON
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

    // Check if every room is complete
    const allComplete = [1, 2, 3, 4].every(
        room => roomTimes[room] !== undefined
    );

    // Unlock ESCAPE
    document.getElementById("escape-button").disabled =
        !allComplete;
}


// SHOW FINAL RESULTS
function showResults() {

    const allComplete = [1, 2, 3, 4].every(
        room => roomTimes[room] !== undefined
    );

    // Do not allow escape until all rooms are complete
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


// INSTRUCTIONS POPUP
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


// INITIALIZE MENU
updateMenu();
