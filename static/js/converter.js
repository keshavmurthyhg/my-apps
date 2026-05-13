let generatedFileName = null;
let pptConverted = false;

function log(message) {
    console.log("[Converter]", message);
}

/* ==========================
   STATUS / PROGRESS
========================== */

function showProgress(message) {
    document
        .getElementById("progressWrapper")
        .classList.remove("hidden");

    document
        .getElementById("progressFill")
        .style.width = "20%";

    document
        .getElementById("progressText")
        .innerText = message;

    document
        .getElementById("statusMessage")
        .innerText = "";
}


function updateProgress(percent, message) {
    document
        .getElementById("progressFill")
        .style.width = percent + "%";

    document
        .getElementById("progressText")
        .innerText = message;
}


function completeProgress(message) {
    document
        .getElementById("progressFill")
        .style.width = "100%";

    // Only show final message once
    document
        .getElementById("progressText")
        .innerText = message;

    // Keep status generic
    document
        .getElementById("statusMessage")
        .innerText = "Completed";
}


function resetProgress() {
    document
        .getElementById("progressFill")
        .style.width = "0%";

    document
        .getElementById("progressText")
        .innerText = "";

    document
        .getElementById("statusMessage")
        .innerText = "Ready";

    document
        .getElementById("progressWrapper")
        .classList.add("hidden");
}


/* ==========================
   PREVIEW
========================== */

async function loadPPTPreview() {
    log("Preview started");
    const fileInput = document.getElementById("pptUpload");

    if (!fileInput.files.length) {
        document.getElementById("statusMessage")
            .innerText = "Upload PPT first";
        return;
    }

    const formData = new FormData();
    formData.append("ppt_file", fileInput.files[0]);

    showProgress("Reading PPT...");
    updateProgress(40, "Extracting incident details...");

    try {
        const response = await fetch("/converter/preview", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Preview failed");
        }

        document.getElementById("previewContainer").innerHTML =
            data.preview_html;

        completeProgress("Preview loaded successfully");

        // Show Convert button after preview
        document.getElementById("convertBtn")
            .classList.remove("hidden");

        // Keep next steps hidden
        document.getElementById("generateBtn")
            .classList.add("hidden");

        document.getElementById("downloadBtn")
            .classList.add("hidden");

    } catch (error) {
        console.error(error);
        log("Preview failed");
        document.getElementById("statusMessage")
            .innerText = "Preview failed";
    }
}


/* ==========================
   CONVERT PPT
========================== */

async function convertPPTSlides() {
    log("PPT conversion started");
    
    const fileInput = document.getElementById("pptUpload");

    if (!fileInput.files.length) {
        document.getElementById("statusMessage")
            .innerText = "Upload PPT first";
        return;
    }

    const formData = new FormData();
    formData.append("ppt_file", fileInput.files[0]);

    showProgress("Converting slides...");
    updateProgress(50, "Extracting PPT slides...");

    try {
        const response = await fetch("/converter/convert", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Conversion failed");
        }

        pptConverted = true;

        document.getElementById("generateBtn")
            .classList.remove("hidden");

        // Hide download until generation completes
        document.getElementById("downloadBtn")
            .classList.add("hidden");
        
        completeProgress("PPT conversion completed");

    } catch (error) {
        console.error(error);
        log("Conversion failed");
        document.getElementById("statusMessage")
            .innerText = "PPT conversion failed";
    }
}


/* ==========================
   GENERATE DOCUMENT
========================== */

async function generateDocument() {
    log("Document generation started");
    if (!pptConverted) {
        document.getElementById("statusMessage")
            .innerText = "Convert PPT first";
        return;
    }

    const fileInput = document.getElementById("pptUpload");

    if (!fileInput.files.length) {
        document.getElementById("statusMessage")
            .innerText = "Upload PPT first";
        return;
    }

    const formData = new FormData();
    formData.append("ppt_file", fileInput.files[0]);

    showProgress("Generating report...");
    updateProgress(80, "Creating DOC file...");

    try {
        const response = await fetch("/converter/generate", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Generation failed");
        }

        generatedFileName = data.filename;

        document.getElementById("downloadBtn")
            .classList.remove("hidden");

        log(
            "Document generated: " +
            generatedFileName
        );
        
        completeProgress("Document generated successfully");

    } catch (error) {
        console.error(error);
        log("Document generation failed");
        document.getElementById("statusMessage")
            .innerText = "Document generation failed";
    }
}


/* ==========================
   DOWNLOAD
========================== */

function downloadConvertedDoc() {
    log(
        "Downloading file: " +
        generatedFileName);
    
    if (!generatedFileName) {
        document.getElementById("statusMessage")
            .innerText = "Generate document first";
        return;
    }

    window.location.href =
        `/converter/download/${generatedFileName}`;
}


/* ==========================
   CLEAR WORKSPACE
========================== */

function clearConverterWorkspace() {
    log("Workspace cleared");
    document.getElementById("pptUpload").value = "";

    document.getElementById("previewContainer").innerHTML =
        "Preview will appear here";

    generatedFileName = null;
    pptConverted = false;

    // Hide all action buttons initially
    document.getElementById("convertBtn")
        .classList.add("hidden");

    document.getElementById("generateBtn")
        .classList.add("hidden");

    document.getElementById("downloadBtn")
        .classList.add("hidden");

    resetProgress();
}

/* ==========================
   SIDEBAR ACCORDION
========================== */

function toggleSidebarSection(header) {
    header.parentElement.classList.toggle("active");
}


/* ==========================
   Hide buttons on initial page load
========================== */
window.onload = function () {
    document.getElementById("convertBtn")
        .classList.add("hidden");

    document.getElementById("generateBtn")
        .classList.add("hidden");

    document.getElementById("downloadBtn")
        .classList.add("hidden");
};


/* =========================
   custom upload wrapper styled
========================= */

function updateSelectedFileName(input) {
    const fileNameText = document.getElementById("selectedFileName");

    if (input.files && input.files.length > 0) {
        const file = input.files[0];

        log(
            "File selected: " +
            input.files[0].name
        );

        fileNameText.textContent = file.name;

        console.log("Selected file:", file.name);
    } 
    else {
        fileNameText.textContent = "No file chosen";
    }
}


/* ==========================
   HOME NAVIGATION
========================== */

function goHome() {
    log("Navigating home");
    window.location.href = "/";
}