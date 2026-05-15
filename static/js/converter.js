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

    document
        .getElementById("progressText")
        .innerText = message;

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
    updateProgress(
        40,
        "Extracting incident details..."
    );

    try {
        const response = await fetch(
            "/converter/preview",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(
                data.error || "Preview failed"
            );
        }

        const previewContainer =
            document.getElementById(
                "previewContainer"
            );

        previewContainer.innerHTML =
            data.preview_html;

        /* -------------------------
        Slide image preview
        ------------------------- */

        const slidePreviewContainer =
            document.getElementById(
                "slidePreviewContainer"
            );

        if (
            data.slide_images &&
            data.slide_images.length > 0
        ) {
            let imageHtml = "";

            data.slide_images.forEach(img => {
                imageHtml += `
                    <div class="ppt-preview-card">
                        <img 
                            src="/converter/slide-preview/${img.filename}"
                            alt="Slide Preview"
                            class="slide-preview-image"
                        >
                    </div>
                `;
            });

            slidePreviewContainer.innerHTML =
                imageHtml;
        }
        else {
            slidePreviewContainer.innerHTML = `
                <p class="preview-placeholder">
                    No slide images found in PPT
                </p>
            `;
        }

        completeProgress(
            "Preview loaded successfully"
        );

        /* show convert button */
        document
            .getElementById("convertBtn")
            .classList.remove("hidden");

        /* keep next buttons hidden */
        document
            .getElementById("generateBtn")
            .classList.add("hidden");

        document
            .getElementById("downloadBtn")
            .classList.add("hidden");

    } catch (error) {
        console.error(error);

        log("Preview failed");

        document
            .getElementById("statusMessage")
            .innerText = "Preview failed";
    }
}


/* ==========================
   CONVERT PPT
========================== */

async function convertPPTSlides() {
    log("PPT conversion started");

    const fileInput =
        document.getElementById("pptUpload");

    if (!fileInput.files.length) {
        document
            .getElementById("statusMessage")
            .innerText = "Upload PPT first";
        return;
    }

    const formData = new FormData();
    formData.append(
        "ppt_file",
        fileInput.files[0]
    );

    showProgress("Converting slides...");
    updateProgress(
        50,
        "Extracting PPT slides..."
    );

    try {
        const response = await fetch(
            "/converter/convert",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(
                data.error ||
                "Conversion failed"
            );
        }

        pptConverted = true;

        /* -----------------------------
           FIX: render converted slides
        ----------------------------- */
        const slidePreviewContainer =
            document.getElementById(
                "slidePreviewContainer"
            );

        if (
            data.slide_images &&
            data.slide_images.length > 0
        ) {
            let imageHtml = `
                <div class="ppt-preview-grid">
            `;

            data.slide_images.forEach(img => {
                imageHtml += `
                    <div class="ppt-preview-card">
                        <img 
                            src="/converter/slide-preview/${img.filename}"
                            alt="Slide Preview"
                            class="slide-preview-image"
                        >
                    </div>
                `;
            });

            imageHtml += `</div>`;

            slidePreviewContainer.innerHTML =
                imageHtml;
        } else {
            slidePreviewContainer.innerHTML = `
                <p class="preview-placeholder">
                    No converted slide images found
                </p>
            `;
        }

        document
            .getElementById("generateBtn")
            .classList.remove("hidden");

        document
            .getElementById("downloadBtn")
            .classList.add("hidden");

        completeProgress(
            "PPT conversion completed"
        );

    } catch (error) {
        console.error(error);

        log("Conversion failed");

        document
            .getElementById("statusMessage")
            .innerText =
            "PPT conversion failed";
    }
}

/* ==========================
   GENERATE DOCUMENT
========================== */

async function generateDocument() {
    log("Document generation started");

    if (!pptConverted) {
        document
            .getElementById("statusMessage")
            .innerText =
            "Convert PPT first";
        return;
    }

    const fileInput =
        document.getElementById(
            "pptUpload"
        );

    if (!fileInput.files.length) {
        document
            .getElementById("statusMessage")
            .innerText =
            "Upload PPT first";
        return;
    }

    const formData = new FormData();
    formData.append(
        "ppt_file",
        fileInput.files[0]
    );

    showProgress(
        "Generating report..."
    );

    updateProgress(
        80,
        "Creating DOC file..."
    );

    try {
        const response = await fetch(
            "/converter/generate",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(
                data.error ||
                "Generation failed"
            );
        }

        generatedFileName =
            data.filename;

        document
            .getElementById("downloadBtn")
            .classList.remove("hidden");

        log(
            "Document generated: " +
            generatedFileName
        );

        completeProgress(
            "Document generated successfully"
        );

    } catch (error) {
        console.error(error);

        log(
            "Document generation failed"
        );

        document
            .getElementById("statusMessage")
            .innerText =
            "Document generation failed";
    }
}


/* ==========================
   DOWNLOAD
========================== */

function downloadConvertedDoc() {
    log(
        "Downloading file: " +
        generatedFileName
    );

    if (!generatedFileName) {
        document
            .getElementById("statusMessage")
            .innerText =
            "Generate document first";
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

    document
        .getElementById("pptUpload")
        .value = "";

    /* Reset incident preview */
    document
        .getElementById(
            "previewContainer"
        ).innerHTML =
    `
    <p class="preview-placeholder">
        Preview will appear here
    </p>
    `;

    /* Reset slide preview */
    document
        .getElementById(
            "slidePreviewContainer"
        ).innerHTML =
    `
    <p class="preview-placeholder">
        Converted slide images will appear here after conversion
    </p>
    `;

    generatedFileName = null;
    pptConverted = false;

    document
        .getElementById("convertBtn")
        .classList.add("hidden");

    document
        .getElementById("generateBtn")
        .classList.add("hidden");

    document
        .getElementById("downloadBtn")
        .classList.add("hidden");

    resetProgress();
}


/* ==========================
   SIDEBAR ACCORDION
========================== */

function toggleSidebarSection(
    header
) {
    header.parentElement
        .classList.toggle(
            "active"
        );
}


/* ==========================
   FILE NAME DISPLAY
========================== */

function updateSelectedFileName(
    input
) {
    const fileNameText =
        document.getElementById(
            "selectedFileName"
        );

    if (
        input.files &&
        input.files.length > 0
    ) {
        const file =
            input.files[0];

        log(
            "File selected: " +
            file.name
        );

        fileNameText.textContent =
            file.name;
    }
    else {
        fileNameText.textContent =
            "No file chosen";
    }
}


/* ==========================
   HOME NAVIGATION
========================== */

function goHome() {
    log("Navigating home");

    window.location.href = "/";
}


/* ==========================
   INITIAL BUTTON STATE
========================== */

window.onload = function () {
    document
        .getElementById("convertBtn")
        .classList.add("hidden");

    document
        .getElementById("generateBtn")
        .classList.add("hidden");

    document
        .getElementById("downloadBtn")
        .classList.add("hidden");
};