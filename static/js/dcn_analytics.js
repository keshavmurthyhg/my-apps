let monthlyChartInstance = null;


// ======================================================
// PAGE LOAD
// ======================================================
document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDashboard();

    }
);


// ======================================================
// INITIALIZE
// ======================================================
function initializeDashboard() {

    bindEvents();

    loadDashboard();

}


// ======================================================
// EVENTS
// ======================================================
function bindEvents() {

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadDashboard
        );

    }

}


// ======================================================
// LOAD DASHBOARD
// ======================================================
async function loadDashboard() {

    try {

        updateProcessingStatus(
            "Loading dashboard..."
        );

        const response = await fetch(
            "/api/dcn-analytics/dashboard"
        );

        const data = await response.json();

        console.log(data);

        if (!data.success) {

            updateProcessingStatus(
                data.message
            );

            return;

        }

        renderKPI(data.kpi);

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
            "Dashboard loaded successfully"
        );

    }
    catch (error) {

        console.error(error);

        updateProcessingStatus(
            error.message
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
            ${kpi.latest_dcn}
        </div>

    `;

    setText(
        "lastUpdatedKpi",
        kpi.last_updated
    );

}


// ======================================================
// CHART
// ======================================================
function renderMonthlyChart(chartData) {

    const canvas =
        document.getElementById(
            "monthlyTrendChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

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
        "#e15759"

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

                    beginAtZero: true

                }

            }

        }

    });

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
                <td colspan="10">
                    No pivot data
                </td>
            </tr>

        `;

        return;
    }

    rows.forEach(row => {

        let tr =
            document.createElement("tr");

        Object.values(row).forEach(value => {

            tr.innerHTML += `
                <td>${value}</td>
            `;

        });

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

            <td>${row.Date}</td>

            <td>${row["Total DCNs"]}</td>

            <td>${row["Sequence Skipped"]}</td>

            <td>${row["Skipped DCN Numbers"]}</td>

        `;

        tbody.appendChild(tr);

    });

}


// ======================================================
// STATUS
// ======================================================
function updateProcessingStatus(message) {

    const status =
        document.getElementById(
            "processingStatus"
        );

    if (!status) return;

    const time =
        new Date().toLocaleTimeString();

    status.innerHTML = `

        [${time}] ${message}

    `;

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