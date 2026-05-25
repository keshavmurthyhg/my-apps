let monthlyChartInstance = null;


// ======================================================
// PAGE LOAD
// ======================================================
document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeDashboard();

    }
);


// ======================================================
// INITIALIZE
// ======================================================
function initializeDashboard() {

    bindEvents();

    showSidebarPanel("kpi");

    handleDateFilterType();

    loadDashboard();

}


// ======================================================
// EVENTS
// ======================================================
function bindEvents() {

    // ==========================================
    // REFRESH
    // ==========================================
    document
        .getElementById("refreshBtn")
        ?.addEventListener(
            "click",
            loadDashboard
        );


    // ==========================================
    // APPLY FILTERS
    // ==========================================
    document
        .getElementById("applyFiltersBtn")
        ?.addEventListener(
            "click",
            applyDashboardFilters
        );


    // ==========================================
    // DOWNLOAD BUTTONS
    // ==========================================
    document
        .getElementById("downloadMonthlyBtn")
        ?.addEventListener(
            "click",
            downloadMonthlyReport
        );

    document
        .getElementById("downloadDailyBtn")
        ?.addEventListener(
            "click",
            downloadDailyReport
        );

}


// ======================================================
// SIDEBAR PANEL SWITCH
// ======================================================
function showSidebarPanel(type) {

    // ==========================================
    // REMOVE ACTIVE
    // ==========================================
    document
        .querySelectorAll(".dock-item")
        .forEach(item => {

            item.classList.remove(
                "active-dock"
            );

        });


    // ==========================================
    // HIDE PANELS
    // ==========================================
    document
        .querySelectorAll(".dock-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    // ==========================================
    // KPI
    // ==========================================
    if (type === "kpi") {

        document
            .getElementById("kpi-section")
            ?.classList.add(
                "active-section"
            );

        document
            .getElementById("kpiDockBtn")
            ?.classList.add(
                "active-dock"
            );

    }


    // ==========================================
    // FILTER
    // ==========================================
    else if (type === "filter") {

        document
            .getElementById("filter-section")
            ?.classList.add(
                "active-section"
            );

        document
            .getElementById("filterDockBtn")
            ?.classList.add(
                "active-dock"
            );

    }


    // ==========================================
    // DOWNLOAD
    // ==========================================
    else if (type === "download") {

        document
            .getElementById("download-section")
            ?.classList.add(
                "active-section"
            );

        document
            .getElementById("downloadDockBtn")
            ?.classList.add(
                "active-dock"
            );

    }

}


// ======================================================
// FILTER TYPE HANDLER
// ======================================================
function handleDateFilterType() {

    // ==========================================
    // HIDE ALL
    // ==========================================
    document
        .querySelectorAll(".date-sub-section")
        .forEach(section => {

            section.classList.remove(
                "active-date-section"
            );

        });


    const filterType =
        document.getElementById(
            "dateFilterType"
        )?.value;


    // ==========================================
    // RANGE
    // ==========================================
    if (filterType === "range") {

        document
            .getElementById(
                "dateRangeSection"
            )
            ?.classList.add(
                "active-date-section"
            );

    }


    // ==========================================
    // YEAR
    // ==========================================
    else if (filterType === "year") {

        document
            .getElementById(
                "yearSection"
            )
            ?.classList.add(
                "active-date-section"
            );

    }


    // ==========================================
    // QUICK
    // ==========================================
    else if (filterType === "quick") {

        document
            .getElementById(
                "quickSection"
            )
            ?.classList.add(
                "active-date-section"
            );

    }

}


// ======================================================
// LOAD DASHBOARD
// ======================================================
async function loadDashboard() {

    try {

        updateProcessingStatus(
            "Loading dashboard...",
            "processing"
        );

        const response = await fetch(
            "/api/dcn-analytics/dashboard"
        );

        const data = await response.json();

        console.log(data);

        if (!data.success) {

            updateProcessingStatus(
                data.message || "Failed to load dashboard",
                "failed"
            );

            return;

        }

        renderKPI(
            data.kpi
        );

        renderMonthlyChart(
            data.chart_data
        );

        renderPivotTable(
            data.monthly_pivot
        );

        renderDailySummary(
            data.daily_summary
        );

        updateProcessingStatus(
            "Dashboard loaded successfully",
            "completed"
        );

    }
    catch (error) {

        console.error(error);

        updateProcessingStatus(
            error.message,
            "failed"
        );

    }

}


// ======================================================
// KPI
// ======================================================
function renderKPI(kpi) {

    setText(
        "totalMissingKpi",
        kpi.total_missing
    );

    setText(
        "currentMonthKpi",
        kpi.current_month
    );

    document.getElementById(
        "latestDcnKpi"
    ).innerHTML = `

        <div class="kpi-latest-dcn">
            ${kpi.latest_dcn || "-"}
        </div>

    `;

    setText(
        "lastUpdatedKpi",
        kpi.last_updated
    );

}


// ======================================================
// MONTHLY CHART
// ======================================================
function renderMonthlyChart(chartData) {

    const canvas =
        document.getElementById(
            "monthlyTrendChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

    // ==========================================
    // DESTROY OLD
    // ==========================================
    if (monthlyChartInstance) {

        monthlyChartInstance.destroy();

    }

    if (
        !chartData ||
        !chartData.labels ||
        !chartData.datasets
    ) {
        return;
    }

    const colors = [

        "#4e79a7",
        "#f28e2b",
        "#e15759",
        "#bab0ac"

    ];

    const datasets =
        chartData.datasets.map(
            (dataset, index) => {

                return {

                    label:
                        dataset.label,

                    data:
                        dataset.data,

                    backgroundColor:
                        colors[index],

                    borderWidth: 1

                };

            }
        );

    monthlyChartInstance = new Chart(ctx, {

        type: "bar",

        data: {

            labels:
                chartData.labels,

            datasets:
                datasets

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true,

                    position: "top"

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

    window.dispatchEvent(new Event("resize"));
}


// ======================================================
// PIVOT TABLE
// ======================================================
function renderPivotTable(rows) {

    const tbody =
        document.getElementById(
            "pivotTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {

        tbody.innerHTML = `

            <tr>
                <td colspan="5">
                    No pivot data
                </td>
            </tr>

        `;

        return;
    }

    rows.forEach(row => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${row.Month || "-"}</td>

            <td>${row["2023"] || 0}</td>

            <td>${row["2024"] || 0}</td>

            <td>${row["2025"] || 0}</td>

            <td>${row["2026"] || 0}</td>

        `;

        tbody.appendChild(tr);

    });

}


// ======================================================
// DAILY SUMMARY
// ======================================================
function renderDailySummary(rows) {

    const tbody =
        document.getElementById(
            "dailySummaryBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!rows || rows.length === 0) {

        tbody.innerHTML = `

            <tr>
                <td colspan="5">
                    No daily summary data
                </td>
            </tr>

        `;

        return;
    }

    rows.forEach((row, index) => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${index + 1}</td>

            <td>${row.Date || "-"}</td>

            <td>${row["Total DCNs"] || 0}</td>

            <td>${row["Sequence Skipped"] || 0}</td>

            <td>${row["Skipped DCN Numbers"] || "-"}</td>

        `;

        tbody.appendChild(tr);

    });

}


// ======================================================
// APPLY FILTERS
// ======================================================
// ======================================================
// APPLY FILTERS
// ======================================================
async function applyDashboardFilters() {

    try {

        updateProcessingStatus(
            "Applying filters...",
            "processing"
        );

        // ==========================================
        // GET FILTER VALUES
        // ==========================================
        const dateField =
            document.getElementById("dateFieldSelect")?.value || "";

        const filterType =
            document.getElementById("dateFilterType")?.value || "";

        const startDate =
            document.getElementById("startDateInput")?.value || "";

        const endDate =
            document.getElementById("endDateInput")?.value || "";

        const selectedYear =
            document.getElementById("yearSelect")?.value || "";

        const quickOption =
            document.querySelector(
                'input[name="quickFilterRadio"]:checked'
            )?.value || "";


        // ==========================================
        // PAYLOAD
        // ==========================================
        const payload = {

            date_field: dateField,

            filter_type: filterType,

            start_date: startDate,

            end_date: endDate,

            year: selectedYear,

            quick_option: quickOption

        };

        console.log("FILTER PAYLOAD:", payload);


        // ==========================================
        // API CALL
        // ==========================================
        const response = await fetch(
            "/api/dcn-analytics/apply-filters",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        console.log(data);


        // ==========================================
        // FAILED
        // ==========================================
        if (!data.success) {

            updateProcessingStatus(
                data.message || "Filter failed",
                "failed"
            );

            return;
        }


        // ==========================================
        // REFRESH DASHBOARD
        // ==========================================
        renderKPI(
            data.kpi
        );

        renderMonthlyChart(
            data.chart_data
        );

        renderPivotTable(
            data.monthly_pivot
        );

        renderDailySummary(
            data.daily_summary
        );


        // ==========================================
        // SUCCESS
        // ==========================================
        updateProcessingStatus(
            "Filters applied successfully",
            "completed"
        );

    }
    catch (error) {

        console.error(error);

        updateProcessingStatus(
            error.message,
            "failed"
        );

    }

}


// ======================================================
// DOWNLOADS
// ======================================================
function downloadMonthlyReport() {

    window.open(
        "/api/dcn-analytics/download/monthly",
        "_blank"
    );

}


function downloadDailyReport() {

    window.open(
        "/api/dcn-analytics/download/daily",
        "_blank"
    );

}


// ======================================================
// STATUS
// ======================================================
function updateProcessingStatus(
    message,
    type = "processing"
) {

    const wrapper =
        document.getElementById(
            "progressWrapper"
        );

    const statusMessage =
        document.getElementById(
            "statusMessage"
        );

    const progressText =
        document.getElementById(
            "progressText"
        );

    const progressFill =
        document.getElementById(
            "progressFill"
        );

    if (
        !wrapper ||
        !statusMessage ||
        !progressText ||
        !progressFill
    ) {
        return;
    }

    wrapper.classList.remove(
        "hidden"
    );

    const time =
        new Date().toLocaleTimeString();

    progressText.innerHTML =
        `[${time}] ${message}`;

    // ==========================================
    // PROCESSING
    // ==========================================
    if (type === "processing") {

        statusMessage.innerText =
            "Processing...";

        progressFill.style.width =
            "60%";

        progressFill.style.background =
            "linear-gradient(90deg,#22c55e,#4ade80)";

    }

    // ==========================================
    // COMPLETED
    // ==========================================
    else if (type === "completed") {

        statusMessage.innerText =
            "Completed";

        progressFill.style.width =
            "100%";

        progressFill.style.background =
            "linear-gradient(90deg,#22c55e,#16a34a)";

    }

    // ==========================================
    // FAILED
    // ==========================================
    else if (type === "failed") {

        statusMessage.innerText =
            "Failed";

        progressFill.style.width =
            "100%";

        progressFill.style.background =
            "linear-gradient(90deg,#ef4444,#dc2626)";

    }

}


// ======================================================
// HELPERS
// ======================================================
function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value ?? "-";

    }

}