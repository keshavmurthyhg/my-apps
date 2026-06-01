function getUniqueValues(data, field) {

    const values = new Set();

    data.forEach(row => {

        const value = row[field];

        if (!value) return;

        String(value)
            .split(",")
            .map(v => v.trim())
            .filter(v => v)
            .forEach(v => values.add(v));

    });

    return Array.from(values).sort();
}

function buildOptions(values) {

    let html = '<option value="All">All</option>';

    values.forEach(v => {

        html += `<option value="${v}">${v}</option>`;

    });

    return html;
}

function updateStatus(message) {

    const statusElement =
        document.getElementById(
            "statusMessage"
        );

    if (statusElement) {
        statusElement.innerText =
            message;
    }
}


async function refreshOperationsData() {

    updateStatus(
        "Refreshing operations data..."
    );

    try {

        const response =
            await fetch(
                "/api/operations-center/refresh"
            );

        const result =
            await response.json();

        if (result.success) {

            updateStatus(
                "Operations data refreshed"
            );

            const refreshEl =
                document.getElementById(
                    "lastRefreshTime"
                );

            if (
                refreshEl &&
                result.refresh_time
            ) {

                refreshEl.textContent =
                    "Last Refresh: " +
                    result.refresh_time;
            }

            setTimeout(() => {

                location.reload();

            }, 1500);
        }

    } catch (error) {

        console.error(error);

        updateStatus(
            "Refresh failed"
        );
    }
}


async function refreshPowerQuery() {

    console.log("refreshPowerQuery called");

    updateStatus(
        "Refreshing Power Query... this may take 1-5 minutes."
    );

    try {

        const response =
            await fetch(
                "/api/operations-center/refresh-power-query"
            );

        const result =
            await response.json();

        if (result.success) {

            updateStatus(
                result.message
            );

            setTimeout(() => {

                location.reload();

            }, 2000);
        

        } else {

            updateStatus(
                result.message
            );
        }

    } catch (error) {

        console.error(error);

        updateStatus(
            "Power Query refresh failed"
        );
    }
}

function showSidebarSection(sectionId, element){

    document
        .querySelectorAll(".dock-section")
        .forEach(section => {
            section.classList.remove("active-dock-section");
        });

    document
        .getElementById(sectionId)
        .classList.add("active-dock-section");

    document
        .querySelectorAll(".dock-item")
        .forEach(item => {
            item.classList.remove("active-dock");
        });

    element.classList.add("active-dock");
}

function updateKpis(section) {

    const grid = document.getElementById("summaryGrid");

    if (!grid) return;

    let html = "";

    switch (section) {

        case "support":

            html = `
                <div class="summary-card">
                    <div class="summary-title">
                        Support Emails
                    </div>
                    <div class="summary-value">
                        ${document.getElementById("supportCountCard").innerText}
                    </div>
                </div>

                <div class="summary-card">
                    <div class="summary-title">
                        Pending Actions
                    </div>
                    <div class="summary-value">
                        ${document.getElementById("pendingActionCard").innerText}
                    </div>
                </div>
            `;

            break;

        case "failure":

            html =
                document.getElementById("failureKpis").innerHTML;

            break;

        case "incident":

            html =
                document.getElementById("incidentKpis").innerHTML;

            break;

        case "azure":

            html =
                document.getElementById("azureKpis").innerHTML;

            break;

        case "ptc":

            html =
                document.getElementById("ptcKpis").innerHTML;

            break;
    }

    grid.innerHTML = html;
}

function buildFilters(section){

    const container =
        document.getElementById(
            "dynamicFilters"
        );

    if(!container) return;

    let html = "";

    switch(section){

        case "support":

            html = `

                <div class="filter-group">

                    <div class="filter-label">
                        Importance
                    </div>

                    <select
                        id="supportImportanceFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                supportData,
                                "Importance"
                            )
                        )}

                    </select>

                    <div class="filter-label">
                        Category
                    </div>

                    <select
                        id="supportCategoryFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                supportData,
                                "Categories"
                            )
                        )}

                    </select>

                </div>

            `;
            break;

        case "failure":

            html = `

                <div class="filter-group">

                    <div class="filter-label">
                        Windchill Server
                    </div>

                    <select
                        id="failureServerFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                failureData,
                                "Windchill Server"
                            )
                        )}

                    </select>

                </div>

            `;
            break;

        case "incident":

            html = `

                <div class="filter-group">

                    <div class="filter-label">
                        Status
                    </div>

                    <select
                        id="incidentStatusFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                incidentData,
                                "Status"
                            )
                        )}

                    </select>

                    <div class="filter-label">
                        Priority
                    </div>

                    <select
                        id="incidentPriorityFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                incidentData,
                                "Priority"
                            )
                        )}

                    </select>

                </div>

            `;
            break;

        case "azure":

            html = `

                <div class="filter-group">

                    <div class="filter-label">
                        Status
                    </div>

                    <select
                        id="azureStatusFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                azureData,
                                "Status"
                            )
                        )}

                    </select>

                    <div class="filter-label">
                        Created By
                    </div>

                    <select
                        id="azureCreatedByFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                azureData,
                                "Created By"
                            )
                        )}

                    </select>

                </div>

            `;
            break;

        case "ptc":

            html = `

                <div class="filter-group">

                    <div class="filter-label">
                        Status
                    </div>

                    <select
                        id="ptcStatusFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                ptcData,
                                "Status"
                            )
                        )}

                    </select>

                    <div class="filter-label">
                        Created By
                    </div>

                    <select
                        id="ptcCreatedByFilter"
                        class="sidebar-filter">

                        ${buildOptions(
                            getUniqueValues(
                                ptcData,
                                "Created By"
                            )
                        )}

                    </select>

                </div>

            `;
            break;
    }

    container.innerHTML = html;
}

function showSection(section) {

    document
        .querySelectorAll(".operations-section")
        .forEach(el => {
            el.classList.remove("active-section");
        });

    document
        .getElementById(section + "Section")
        .classList.add("active-section");

    document
        .querySelectorAll(".tracker-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    const toolbarBtn =
        document.getElementById(
            section + "ToolbarBtn"
        );

    if (toolbarBtn) {
        toolbarBtn.classList.add("active");
    }

    buildFilters(section);

    updateKpis(section);
}

function applyFilters() {

    const activeSection =
        document.querySelector(
            ".operations-section.active-section"
        );

    if (!activeSection) return;

    const sectionId =
        activeSection.id;

    const rows =
        activeSection.querySelectorAll(
            "tbody tr"
        );

    let visibleCount = 0;

    rows.forEach(row => {

        let visible = true;

        // SUPPORT
        if (sectionId === "supportSection") {

            const importance =
                row.cells[3].innerText.trim();

            const category =
                row.cells[4].innerText.trim();

            const importanceFilter =
                document.getElementById(
                    "supportImportanceFilter"
                )?.value || "All";

            const categoryFilter =
                document.getElementById(
                    "supportCategoryFilter"
                )?.value || "All";

            if (
                importanceFilter !== "All" &&
                importance !== importanceFilter
            ) {
                visible = false;
            }

            if (
                categoryFilter !== "All"
            ) {

                const categories =
                    category
                        .split(",")
                        .map(v => v.trim());

                if (
                    !categories.includes(
                        categoryFilter
                    )
                ) {
                    visible = false;
                }
            }
        }

        // FAILURES
        else if (
            sectionId === "failureSection"
        ) {

            const server =
                row.cells[4].innerText.trim();

            const serverFilter =
                document.getElementById(
                    "failureServerFilter"
                )?.value || "All";

            if (
                serverFilter !== "All" &&
                server !== serverFilter
            ) {
                visible = false;
            }
        }

        // INCIDENTS
        else if (
            sectionId === "incidentSection"
        ) {

            const status =
                row.cells[4].innerText.trim();

            const priority =
                row.cells[5].innerText.trim();

            const statusFilter =
                document.getElementById(
                    "incidentStatusFilter"
                )?.value || "All";

            const priorityFilter =
                document.getElementById(
                    "incidentPriorityFilter"
                )?.value || "All";

            if (
                statusFilter !== "All" &&
                status !== statusFilter
            ) {
                visible = false;
            }

            if (
                priorityFilter !== "All" &&
                priority !== priorityFilter
            ) {
                visible = false;
            }
        }

        // AZURE
        else if (
            sectionId === "azureSection"
        ) {

            const status =
                row.cells[3].innerText.trim();

            const createdBy =
                row.cells[5].innerText.trim();

            const statusFilter =
                document.getElementById(
                    "azureStatusFilter"
                )?.value || "All";

            const createdByFilter =
                document.getElementById(
                    "azureCreatedByFilter"
                )?.value || "All";

            if (
                statusFilter !== "All" &&
                status !== statusFilter
            ) {
                visible = false;
            }

            if (
                createdByFilter !== "All" &&
                createdBy !== createdByFilter
            ) {
                visible = false;
            }
        }

        // PTC
        else if (
            sectionId === "ptcSection"
        ) {

            const status =
                row.cells[3].innerText.trim();

            const createdBy =
                row.cells[5].innerText.trim();

            const statusFilter =
                document.getElementById(
                    "ptcStatusFilter"
                )?.value || "All";

            const createdByFilter =
                document.getElementById(
                    "ptcCreatedByFilter"
                )?.value || "All";

            if (
                statusFilter !== "All" &&
                status !== statusFilter
            ) {
                visible = false;
            }

            if (
                createdByFilter !== "All" &&
                createdBy !== createdByFilter
            ) {
                visible = false;
            }
        }

        row.style.display =
            visible ? "" : "none";

        if (visible) {
            visibleCount++;
        }

    });

    updateStatus(
        visibleCount +
        " records found"
    );
}


setInterval(() => {

    refreshOperationsData();

}, 300000);

async function loadIncidentTracker() {

    try {

        const response =
            await fetch(
                "/api/operations-center/refresh"
            );

        const result =
            await response.json();

        if (!result.success) {
            return;
        }

        const incidentData =
            result.incident_data || [];

        const tbody =
            document.querySelector(
                "#incidentSection tbody"
            );

        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";

        incidentData.forEach(row => {

            tbody.innerHTML += `

                <tr>

                    <td>${row["Number"] || ""}</td>

                    <td>${row["Vendor Ticket"] || ""}</td>

                    <td>${row["Description"] || ""}</td>

                    <td>${row["Assigned To"] || ""}</td>

                    <td>${row["Status"] || ""}</td>

                    <td>${row["Priority"] || ""}</td>

                    <td>${row["Created Date"] || ""}</td>

                </tr>

            `;
        });

        updateStatus(
            incidentData.length +
            " incidents found"
        );

    }

    catch(error) {

        console.error(error);

        updateStatus(
            "Incident load failed"
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadRefreshStatus();

        updateKpis("support");

        buildFilters("support");

        const applyBtn =
            document.querySelector(
                ".btn-apply-filters"
            );

        if (applyBtn) {

            applyBtn.addEventListener(
                "click",
                applyFilters
            );
        }
    }
);

async function loadRefreshStatus() {

    try {

        const response = await fetch(
            "/api/refresh-status"
        );

        const data = await response.json();

        const el =
            document.getElementById(
                "lastRefreshTime"
            );

        if (el) {

            el.textContent =
                `Last Refresh: ${data.last_refresh}`;
        }

    } catch (err) {

        console.error(err);
    }
}

window.clearWorkspace = function () {

    // reset dropdowns
    document
        .querySelectorAll(".sidebar-filter")
        .forEach(filter => {
            filter.value = "All";
        });

    // show all rows in current tracker
    document
        .querySelectorAll(
            ".operations-section tbody tr"
        )
        .forEach(row => {
            row.style.display = "";
        });

    updateStatus("Ready");

    console.log(
        "Operations Center workspace cleared"
    );
};