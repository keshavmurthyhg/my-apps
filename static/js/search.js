document.getElementById("searchBtn").addEventListener("click", async function () {

    const query = document.getElementById("searchInput").value;

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
});


function populateSearchTable(results) {
    const tbody = document.getElementById("searchResultsBody");
    tbody.innerHTML = "";

    results.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.number}</td>
                <td>${item.description}</td>
                <td>${item.priority}</td>
                <td>${item.status}</td>
                <td>${item.created_by}</td>
                <td>${item.created_date}</td>
                <td>${item.assigned_to}</td>
                <td>${item.resolved_date}</td>
                <td>${item.source}</td>
                <td>
                    <a href="${item.url}" target="_blank">
                        Open
                    </a>
                </td>
            </tr>
        `;
    });
}