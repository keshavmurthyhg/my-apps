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

            location.reload();
        }

    } catch (error) {

        console.error(error);

        updateStatus(
            "Refresh failed"
        );
    }
}


async function refreshPowerQuery() {

    updateStatus(
        "Refreshing Power Query..."
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

            }, 1500);

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


function showSection(section) {

    document
        .querySelectorAll(".operations-section")
        .forEach(el => {
            el.classList.remove(
                "active-section"
            );
        });

    document
        .querySelectorAll(".sidebar-item")
        .forEach(el => {
            el.classList.remove(
                "active"
            );
        });

    const supportCards =
        document.querySelectorAll(
            ".support-kpi"
        );

    const failureCards =
        document.querySelectorAll(
            ".failure-kpi"
        );

    const summaryGrid =
        document.getElementById(
            "summaryGrid"
        );

    supportCards.forEach(card => {
        card.style.display = "none";
    });

    failureCards.forEach(card => {
        card.style.display = "none";
    });

    summaryGrid.style.display = "grid";

    if (section === "support") {

        document
            .getElementById(
                "supportSection"
            )
            .classList.add(
                "active-section"
            );

        document
            .getElementById(
                "supportTab"
            )
            .classList.add(
                "active"
            );

        supportCards.forEach(card => {
            card.style.display = "flex";
        });
    }

    else if (section === "failure") {

        document
            .getElementById(
                "failureSection"
            )
            .classList.add(
                "active-section"
            );

        document
            .getElementById(
                "failureTab"
            )
            .classList.add(
                "active"
            );

        failureCards.forEach(card => {
            card.style.display = "flex";
        });
    }

    else if (section === "incident") {

        document
            .getElementById(
                "incidentSection"
            )
            .classList.add(
                "active-section"
            );

        document
            .getElementById(
                "incidentTab"
            )
            .classList.add(
                "active"
            );

        summaryGrid.style.display = "none";
    }
}


function applyFilters() {

    const supportVisible =
        document.getElementById(
            "supportSection"
        ).classList.contains(
            "active-section"
        );

    if (!supportVisible) {
        return;
    }

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        ).value.toLowerCase();

    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        ).value.toLowerCase();

    const rows =
        document.querySelectorAll(
            "#supportSection .ops-table tbody tr"
        );

    let visibleCount = 0;
    let pendingCount = 0;

    rows.forEach(row => {

        const priority =
            row.cells[3]
            .innerText
            .trim()
            .toLowerCase();

        const category =
            row.cells[4]
            .innerText
            .trim()
            .toLowerCase();

        let visible = true;

        if (
            categoryFilter &&
            !category.includes(categoryFilter)
        ) {
            visible = false;
        }

        if (
            priorityFilter &&
            !priority.includes(priorityFilter)
        ) {
            visible = false;
        }

        row.style.display =
            visible ? "" : "none";

        if (visible) {

            visibleCount++;

            if (
                category.includes(
                    "action required"
                )
            ) {
                pendingCount++;
            }
        }
    });

    document.getElementById(
        "supportCountCard"
    ).innerText =
        visibleCount;

    document.getElementById(
        "pendingActionCard"
    ).innerText =
        pendingCount;

    updateStatus(
        visibleCount +
        " records found"
    );
}


setInterval(() => {

    refreshOperationsData();

}, 300000);