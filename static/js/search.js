function showSearchSection(section) {

    document
        .querySelectorAll(".dock-section")
        .forEach(el => el.classList.remove("active-section"));

    document
        .querySelectorAll(".dock-item")
        .forEach(el => el.classList.remove("active-dock"));

    document
        .getElementById(section + "-section")
        .classList.add("active-section");

    event.target.classList.add("active-dock");
}


async function performSearch() {

    const query = document
        .getElementById("searchInput")
        .value;

    document.getElementById("statusMessage").innerText =
        "Searching...";

    const response = await fetch("/search/issues", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: query
        })
    });

    const data = await response.json();

    populateSearchTable(data.results);

    updateSummary(data.results);

    document.getElementById("activeSearch").innerText =
        query || "-";

    document.getElementById("searchResultStatus").innerText =
        data.results.length + " records";

    document.getElementById("lastSearchAction").innerText =
        "Search completed";

    document.getElementById("statusMessage").innerText =
        "Ready";
}


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

    document.getElementById("activeSearch").innerText = "-";

    document.getElementById("searchResultStatus").innerText =
        "0 records";

    document.getElementById("lastSearchAction").innerText =
        "Workspace cleared";
}


function populateSearchTable(results) {

    const tbody = document.getElementById(
        "searchResultsBody"
    );

    tbody.innerHTML = "";

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

    results.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>${item.number}</td>

                <td title="${item.description}">
                    ${truncate(item.description, 70)}
                </td>

                <td>${item.priority}</td>

                <td>${item.status}</td>

                <td>${item.created_by}</td>

                <td>${item.created_date}</td>

                <td>${item.assigned_to}</td>

                <td>${item.resolved_date}</td>

                <td>${item.source}</td>

                <td>
                    <a href="${item.url}"
                       target="_blank">
                        Open
                    </a>
                </td>

            </tr>
        `;
    });
}


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


function truncate(text, len) {

    if (!text) return "";

    return text.length > len
        ? text.substring(0, len) + "..."
        : text;
}