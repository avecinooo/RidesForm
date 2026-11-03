function startGame() {
    const name = document.getElementById("playerName").value.trim();

    if (!name) {
        alert("Please enter your name first.");
        return;
    }

    localStorage.setItem("playerName", name);

    alert("Welcome, " + name + ". The facility is now in lockdown.");

    // We will replace this with the actual first room.
}
