function showProgress(message) {
    document.getElementById("progressWrapper")
        ?.classList.remove("hidden");

    document.getElementById("progressFill")
        ?.style.width = "20%";

    document.getElementById("progressText")
        .innerText = message;

    document.getElementById("statusMessage")
        .innerText = "Processing...";
}

function updateProgress(percent, message) {
    document.getElementById("progressFill")
        .style.width = percent + "%";

    document.getElementById("progressText")
        .innerText = message;
}

function completeProgress(message) {
    document.getElementById("progressFill")
        .style.width = "100%";

    document.getElementById("progressText")
        .innerText = "Completed";

    document.getElementById("statusMessage")
        .innerText = message;

    setTimeout(() => {
        document.getElementById("progressWrapper")
            ?.classList.add("hidden");
    }, 1500);
}

function failProgress(message) {
    document.getElementById("statusMessage")
        .innerText = message;
}

function toggleSidebarSection(header) {
    header.parentElement.classList.toggle("active");
}

function goHome() {
    window.location.href = "/";
}