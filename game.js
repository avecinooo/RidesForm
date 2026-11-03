
let playerName = "";
let puzzleStartTime = 0;
let puzzleTimer = null;
let discoveredClues = [];
let puzzleComplete = false;

const puzzleObjects = {
    frisbees: {
        title: "Stack of Frisbees",
        description: "Several discs are stacked on the shelf. You notice something written underneath the top disc.",
        clue: "7",
        clueText: "The number underneath the frisbee stack is 7."
    },

    cleats: {
        title: "Old Cleats",
        description: "A pair of muddy cleats has been left by the door. There is a faded number written inside the right shoe.",
        clue: "4",
        clueText: "The number inside the right cleat is 4."
    },

    bag: {
        title: "Equipment Bag",
        description: "You unzip an old equipment bag. Among the cones and jerseys, you find a tag with a number.",
        clue: "2",
        clueText: "The equipment bag tag has the number 2."
    },

    clipboard: {
        title: "Team Clipboard",
        description: "An old clipboard contains a tournament roster. On the back, someone has written a mysterious number.",
        clue: "9",
        clueText: "The back of the clipboard has the number 9."
    },

    whiteboard: {
        title: "Whiteboard",
        description: "Someone has left a message on the whiteboard. It reads:\n\n'First the flying disc, then the shoes. Next comes the bag, and finally the roster.'\n\nLooks like you've found the order of the combination."
    }
};

function startGame() {
    const name = document.getElementById("playerName").value.trim();

    if (!name) {
        alert("Please enter your name first.");
        return;
    }

    playerName = name;
    localStorage.setItem("playerName", name);

    discoveredClues = [];
    puzzleComplete = false;

    loadRoomOne();
}

function loadRoomOne() {
    const container = document.querySelector(".container");

    container.innerHTML = `
        <div class="room-header">
            <div class="top-label">VIRGINIA TECH ULTIMATE // ROOM 01</div>
            <h1>THE EQUIPMENT CLOSET</h1>
            <p class="subtitle">Find the combination. Unlock the cabinet.</p>
        </div>

        <div class="room-info">
            <div>PLAYER: <span id="playerDisplay"></span></div>
            <div>TIME: <span id="puzzleTimer">00:00</span></div>
        </div>

        <div class="room-description">
            The equipment closet is dark and unusually quiet.
            A locked cabinet stands against the back wall.
            There must be something in this room that can help you open it.
            <br><br>
            <strong>Investigate the objects to find four numbers.</strong>
        </div>

        <div class="room-scene">

            <button class="room-object frisbees"
                onclick="inspectObject('frisbees')">
                <span>🥏</span>
                <small>FRISBEES</small>
            </button>

            <button class="room-object cleats"
                onclick="inspectObject('cleats')">
                <span>👟</span>
                <small>CLEATS</small>
            </button>

            <button class="room-object bag"
                onclick="inspectObject('bag')">
                <span>🎒</span>
                <small>EQUIPMENT BAG</small>
            </button>

            <button class="room-object clipboard"
                onclick="inspectObject('clipboard')">
                <span>📋</span>
                <small>CLIPBOARD</small>
            </button>

            <button class="room-object whiteboard"
                onclick="inspectObject('whiteboard')">
                <span>📝</span>
                <small>WHITEBOARD</small>
            </button>

            <button class="room-object cabinet"
                onclick="openCabinet()">
                <span>🔒</span>
                <small>LOCKED CABINET</small>
            </button>

        </div>

        <div class="clue-section">
            <h2>YOUR CLUE INVENTORY</h2>
            <div class="clue-inventory" id="clueInventory">
                <div class="clue-slot">?</div>
                <div class="clue-slot">?</div>
                <div class="clue-slot">?</div>
                <div class="clue-slot">?</div>
            </div>
            <p class="inventory-note">Discover clues to fill your inventory.</p>
        </div>

        <div class="room-actions">
            <button class="hint-button" onclick="showHint()">
                REQUEST HINT
            </button>
        </div>

        <div id="objectModal" class="modal hidden">
            <div class="modal-content">
                <button class="close-button" onclick="closeModal()">×</button>
                <h2 id="objectTitle"></h2>
                <p id="objectDescription"></p>
                <div id="objectClue"></div>
                <button onclick="closeModal()">BACK TO ROOM</button>
            </div>
        </div>

        <div id="completionModal" class="modal hidden">
            <div class="modal-content completion-content">
                <div class="success-icon">✓</div>
                <h2>CABINET UNLOCKED!</h2>
                <p>You found the combination and escaped the first room.</p>
                <div class="completion-time">
                    YOUR TIME
                    <h1 id="finalPuzzleTime">00:00</h1>
                </div>
                <p>One room down. Three more to go.</p>
                <button onclick="continueGame()">CONTINUE</button>
            </div>
        </div>
    `;

    document.getElementById("playerDisplay").textContent = playerName;

    puzzleStartTime = Date.now();

    clearInterval(puzzleTimer);

    puzzleTimer = setInterval(updatePuzzleTimer, 250);
}

function updatePuzzleTimer() {
    if (puzzleComplete) return;

    const elapsed = Math.floor((Date.now() - puzzleStartTime) / 1000);

    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");

    const timer = document.getElementById("puzzleTimer");

    if (timer) {
        timer.textContent = `${minutes}:${seconds}`;
    }
}

function inspectObject(objectId) {
    const object = puzzleObjects[objectId];

    document.getElementById("objectTitle").textContent = object.title;
    document.getElementById("objectDescription").textContent = object.description;

    const clueArea = document.getElementById("objectClue");

    if (object.clue) {

        if (!discoveredClues.includes(objectId)) {
            discoveredClues.push(objectId);
        }

        clueArea.innerHTML = `
            <div class="discovered-clue">
                CLUE DISCOVERED: ${object.clue}
            </div>
        `;

        updateInventory();

    } else {
        clueArea.innerHTML = `
            <div class="discovered-clue">
                ORDER CLUE FOUND!
            </div>
        `;
    }

    document.getElementById("objectModal").classList.remove("hidden");
}

function updateInventory() {
    const inventory = document.getElementById("clueInventory");

    const clueOrder = ["frisbees", "cleats", "bag", "clipboard"];

    inventory.innerHTML = clueOrder.map(id => {
        const found = discoveredClues.includes(id);

        return `
            <div class="clue-slot ${found ? "found" : ""}">
                ${found ? puzzleObjects[id].clue : "?"}
            </div>
        `;
    }).join("");
}

function closeModal() {
    document.getElementById("objectModal").classList.add("hidden");
}

function openCabinet() {
    document.getElementById("objectTitle").textContent = "LOCKED CABINET";

    document.getElementById("objectDescription").textContent =
        "The cabinet has a four-digit combination lock. Enter the code to unlock it.";

    document.getElementById("objectClue").innerHTML = `
        <div class="combination-lock">
            <input class="code-digit" maxlength="1" inputmode="numeric">
            <input class="code-digit" maxlength="1" inputmode="numeric">
            <input class="code-digit" maxlength="1" inputmode="numeric">
            <input class="code-digit" maxlength="1" inputmode="numeric">
        </div>
        <p id="lockMessage"></p>
        <button onclick="checkCombination()">UNLOCK CABINET</button>
    `;

    document.getElementById("objectModal").classList.remove("hidden");

    document.querySelectorAll(".code-digit").forEach((input, index, inputs) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);

            if (input.value && index < 3) {
                inputs[index + 1].focus();
            }
        });
    });
}

function checkCombination() {
    const inputs = document.querySelectorAll(".code-digit");

    const enteredCode = Array.from(inputs)
        .map(input => input.value)
        .join("");

    const message = document.getElementById("lockMessage");

    if (enteredCode.length !== 4) {
        message.textContent = "Enter all four digits.";
        return;
    }

    if (enteredCode === "7429") {
        completePuzzle();
    } else {
        message.textContent = "Incorrect combination. Keep searching!";
        inputs.forEach(input => input.value = "");
        inputs[0].focus();
    }
}

function completePuzzle() {
    puzzleComplete = true;
    clearInterval(puzzleTimer);

    const elapsed = Math.floor((Date.now() - puzzleStartTime) / 1000);

    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");

    const formattedTime = `${minutes}:${seconds}`;

    document.getElementById("objectModal").classList.add("hidden");

    document.getElementById("finalPuzzleTime").textContent = formattedTime;

    document.getElementById("completionModal").classList.remove("hidden");

    localStorage.setItem("room1Time", elapsed);
}

function showHint() {
    alert(
        "HINT: Investigate every object. The whiteboard tells you the order in which to arrange the four numbers."
    );
}

function continueGame() {
    alert("Room 02 is coming next!");
}
