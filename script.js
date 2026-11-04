
const startButton = document.getElementById("start-button");
const instructionsButton = document.getElementById("instructions-button");
const closeInstructions = document.getElementById("close-instructions");

const instructionsModal = document.getElementById("instructions-modal");
const menuContainer = document.querySelector(".menu-container");
const gameScreen = document.getElementById("game-screen");

// Open instructions
instructionsButton.addEventListener("click", () => {
    instructionsModal.classList.remove("hidden");
});

// Close instructions
closeInstructions.addEventListener("click", () => {
    instructionsModal.classList.add("hidden");
});

// Start the game
startButton.addEventListener("click", () => {
    menuContainer.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    // We'll initialize the overall timer and Room 1 here later.
});
