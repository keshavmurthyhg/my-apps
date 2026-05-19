/* =========================================
   GLOBAL STATE
========================================= */

let currentResults = [];

let currentPage = 1;

let rowsPerPage = 10;

/* =========================================
   SHOW SEARCH SECTION
========================================= */
function showSearchSection(section) {

    document
        .querySelectorAll(".dock-section")
        .forEach(el => {
            el.classList.remove("active-section");
        });

    document
        .querySelectorAll(".dock-item")
        .forEach(el => {
            el.classList.remove("active-dock");
        });

    document
        .getElementById(section + "-section")
        .classList.add("active-section");

    event.currentTarget.classList.add("active-dock");
}

/* =========================================
   LOAD FILTER OPTIONS
========================================= */

async function loadFilterOptions() {

    try {

        const response =
            await fetch("/search/filter-options");

        const data =
            await response.json();


        populateDropdown(
            "statusFilter",
            data.status,
            "Status"
        );

        populateDropdown(
            "priorityFilter",
            data.priority,
            "Priority"
        );

        populateDropdown(
            "groupFilter",
            data.groups,
            "Group"
        );

    }

    catch(error) {

        console.error(error);

    }
}


/* =========================================
   POPULATE DROPDOWN
========================================= */

function populateDropdown(id, values, label) {

    const dropdown =
        document.getElementById(id);

    dropdown.innerHTML =
        `<option value="">${label}</option>`;

    values.forEach(value => {

        dropdown.innerHTML += `
            <option value="${value}">
                ${value}
            </option>
        `;
    });
}

/* =========================================
   SEARCH
========================================= */

async function performSearch() {

    try {

        // -----------------------------------
        // QUERY
        // -----------------------------------
        const query =
            document.getElementById(
                "searchInput"
            ).value.trim();


        // -----------------------------------
        // STATUS UI
        // -----------------------------------
        document.getElementById(
            "searchStatusText"
        ).innerText = "Searching issues...";


        const progressBar =
            document.getElementById(
                "searchProgressFill"
            );

        progressBar.style.width = "70%";

        progressBar.classList.add(
            "active-progress"
        );


        // -----------------------------------
        // SOURCE FILTERS
        // -----------------------------------
        const selectedSources = Array.from(

            document.querySelectorAll(
                ".source-item:checked"
            )

        ).map(el => el.value);


        // -----------------------------------
        // DROPDOWN FILTERS
        // -----------------------------------
        const selectedStatus =
            document.getElementById(
                "statusFilter"
            ).value;

        const selectedPriority =
            document.getElementById(
                "priorityFilter"
            ).value;

        const selectedGroup =
            document.getElementById(
                "groupFilter"
            ).value;


        // -----------------------------------
        // DATE FILTERS
        // -----------------------------------
        const dateField =
            document.getElementById(
                "dateField"
            ).value;

        const startDate =
            document.getElementById(
                "startDate"
            ).value;

        const endDate =
            document.getElementById(
                "endDate"
            ).value;


        // -----------------------------------
        // API CALL
        // -----------------------------------
        const response = await fetch(
            "/search/issues",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    query: query,

                    sources: selectedSources,

                    status: selectedStatus,

                    priority: selectedPriority,

                    group: selectedGroup,

                    date_field: dateField,

                    start_date: startDate,

                    end_date: endDate
                })
            }
        );


        // -----------------------------------
        // RESPONSE
        // -----------------------------------
        const data =
            await response.json();


        // -----------------------------------
        // ERROR
        // -----------------------------------
        if (data.error) {

            document.getElementById(
                "searchStatusText"
            ).innerText = data.error;

            progressBar.style.width = "0%";

            progressBar.classList.remove(
                "active-progress"
            );

            return;
        }


        // -----------------------------------
        // TABLE
        // -----------------------------------
        currentResults = data.results;

        currentPage = 1;

        renderCurrentPage();

        updateSummary(currentResults);

        // -----------------------------------
        // COMPLETE
        // -----------------------------------
        document.getElementById(
            "searchStatusText"
        ).innerText =
            "Search completed successfully";


        progressBar.style.width = "100%";

        progressBar.classList.remove(
            "active-progress"
        );

    }

    catch(error) {

        console.error(error);

        document.getElementById(
            "searchStatusText"
        ).innerText =
            "Search failed";

        document.getElementById(
            "searchProgressFill"
        ).classList.remove(
            "active-progress"
        );
    }
}


/* =========================================
   EVENTS
========================================= */

document
    .getElementById("searchBtn")
    .addEventListener("click", performSearch);


document
    .getElementById("searchInput")
    .addEventListener("keypress", function(e) {

        if (e.key === "Enter") {
            performSearch();
        }
    });


document
    .getElementById("clearBtn")
    .addEventListener("click", clearSearchWorkspace);


/* =========================================
   CLEAR
========================================= */

function clearSearchWorkspace() {

    document.getElementById("searchInput").value = "";

    document.getElementById("searchResultsBody").innerHTML = `
        <tr>
            <td colspan="11"
                class="empty-search-message">
                Workspace cleared
            </td>
        </tr>
    `;

    updateSummary([]);

    document.getElementById("searchStatusText").innerText =
        "Workspace cleared";

    const progressBar =
        document.getElementById("searchProgressFill");

    progressBar.style.width = "0%";

    progressBar.classList.remove("active-progress");
}


/* =========================================
   SOURCE CHECKBOXES
========================================= */

const allCheckbox =
    document.getElementById("source_all");

const sourceCheckboxes =
    document.querySelectorAll(".source-item");


allCheckbox.addEventListener("change", function () {

    sourceCheckboxes.forEach(cb => {
        cb.checked = allCheckbox.checked;
    });

});


sourceCheckboxes.forEach(cb => {

    cb.addEventListener("change", function () {

        const checkedCount = Array.from(
            sourceCheckboxes
        ).filter(x => x.checked).length;

        allCheckbox.checked =
            checkedCount === sourceCheckboxes.length;

    });

});


/* =========================================
   TABLE
========================================= */

function populateSearchTableRows(results) {

    const tbody = document.getElementById(
        "searchResultsBody"
    );

    tbody.innerHTML = "";


    // -----------------------------------
    // EMPTY
    // -----------------------------------
    if (!results.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="11"
                    class="empty-search-message">
                    No records found
                </td>
            </tr>
        `;

        return;
    }


    // -----------------------------------
    // LIMIT LARGE DATASETS
    // -----------------------------------
    const limitedResults = results.slice(0, 500);


    // -----------------------------------
    // BUILD HTML STRING
    // -----------------------------------
    let rowsHtml = "";


    limitedResults.forEach((item, index) => {

        rowsHtml += `
            <tr>

                <td>${index + 1}</td>

                <td>

                    ${
                        item.url
                            ? `
                                <a href="${item.url}"
                                target="_blank"
                                class="number-link">

                                    ${item.number}

                                </a>
                            `
                            : item.number
                    }

                </td>

                <td title="${item.description}">
                    ${truncate(item.description, 45)}
                </td>

                <td>${item.priority}</td>

                <td>${item.status}</td>

                <td>${item.created_by}</td>

                <td>${item.created_date}</td>

                <td>${item.assigned_to}</td>

                <td>${item.resolved_date}</td>


            </tr>
        `;
    });


    // -----------------------------------
    // SINGLE DOM UPDATE
    // -----------------------------------
    tbody.innerHTML = rowsHtml;


    // -----------------------------------
    // LARGE RESULT WARNING
    // -----------------------------------
    if (results.length > 500) {

        tbody.innerHTML += `
            <tr>

                <td colspan="9"
                    class="empty-search-message">

                    Showing first 500 records out of
                    ${results.length}

                </td>

            </tr>
        `;
    }
}

/* =========================================
   PAGINATION
========================================= */

function renderCurrentPage() {

    rowsPerPage = parseInt(

        document.getElementById(
            "rowsPerPage"
        ).value

    );

    const start =
        (currentPage - 1) * rowsPerPage;

    const end =
        start + rowsPerPage;

    const pagedResults =
        currentResults.slice(start, end);


    populateSearchTableRows(
        pagedResults
    );

    updatePageInfo();
}


/* =========================================
   PAGE INFO
========================================= */

function updatePageInfo() {

    const total =
        currentResults.length;

    const totalPages = Math.max(
        1,
        Math.ceil(total / rowsPerPage)
    );

    const start =
        total === 0
            ? 0
            : ((currentPage - 1) * rowsPerPage) + 1;

    const end =
        Math.min(
            currentPage * rowsPerPage,
            total
        );


    document.getElementById(
        "pageInfo"
    ).innerText =
        `${start} to ${end} of ${total}`;


    // buttons
    document.getElementById(
        "firstPageBtn"
    ).disabled = currentPage === 1;

    document.getElementById(
        "prevPageBtn"
    ).disabled = currentPage === 1;

    document.getElementById(
        "nextPageBtn"
    ).disabled =
        currentPage === totalPages;

    document.getElementById(
        "lastPageBtn"
    ).disabled =
        currentPage === totalPages;
}

/* =========================================
   SUMMARY
========================================= */

function updateSummary(results) {

    document.getElementById("resultCount").innerText =
        results.length;

    document.getElementById("azureCount").innerText =
        results.filter(x => x.source === "AZURE").length;

    document.getElementById("snowCount").innerText =
        results.filter(x => x.source === "SNOW").length;

    document.getElementById("ptcCount").innerText =
        results.filter(x => x.source === "PTC").length;
}


/* =========================================
   TRUNCATE
========================================= */

function truncate(text, len) {

    if (!text) return "";

    return text.length > len
        ? text.substring(0, len) + "..."
        : text;
}

/* =========================================
   APPLY FILTERS
========================================= */

function applySearchFilters() {

    document.getElementById("searchStatusText").innerText =
        "Filters updated";

}

/* =========================================
   INITIAL LOAD
========================================= */

loadFilterOptions();

/* =========================================
   DATE FILTER MODES
========================================= */

function handleDateFilterType() {

    // hide all
    document
        .querySelectorAll(".date-sub-section")
        .forEach(el => {
            el.classList.remove(
                "active-date-section"
            );
        });


    const type =
        document.getElementById(
            "dateFilterType"
        ).value;


    // no filter
    if (type === "none") {
        return;
    }


    // date range
    if (type === "range") {

        document
            .getElementById(
                "dateRangeSection"
            )
            .classList.add(
                "active-date-section"
            );
    }


    // year
    if (type === "year") {

        document
            .getElementById(
                "yearSection"
            )
            .classList.add(
                "active-date-section"
            );
    }


    // quick
    if (type === "quick") {

        document
            .getElementById(
                "quickSection"
            )
            .classList.add(
                "active-date-section"
            );
    }
}


/* =========================================
   INITIALIZE DATE FILTER
========================================= */

handleDateFilterType();


/* =========================================
   ROWS
========================================= */

document
    .getElementById("rowsPerPage")
    .addEventListener("change", function() {

        currentPage = 1;

        renderCurrentPage();
    });


/* =========================================
   PAGINATION BUTTONS
========================================= */

document
    .getElementById("firstPageBtn")
    .addEventListener("click", function() {

        currentPage = 1;

        renderCurrentPage();
    });


document
    .getElementById("prevPageBtn")
    .addEventListener("click", function() {

        if (currentPage > 1) {

            currentPage--;

            renderCurrentPage();
        }
    });


document
    .getElementById("nextPageBtn")
    .addEventListener("click", function() {

        const totalPages = Math.ceil(
            currentResults.length /
            rowsPerPage
        );

        if (currentPage < totalPages) {

            currentPage++;

            renderCurrentPage();
        }
    });


document
    .getElementById("lastPageBtn")
    .addEventListener("click", function() {

        currentPage = Math.ceil(
            currentResults.length /
            rowsPerPage
        );

        renderCurrentPage();
    });