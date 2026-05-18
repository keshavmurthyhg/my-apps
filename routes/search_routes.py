from flask import (
    Blueprint,
    render_template,
    request,
    jsonify
)

from modules.search.data_loader import load_data
from modules.search.kpi import calculate_kpi
from modules.search.search import apply_search


# -----------------------------------
# Blueprint
# -----------------------------------
search_bp = Blueprint(
    "search",
    __name__
)


# -----------------------------------
# Search Page
# -----------------------------------
@search_bp.route("/search")
def search_page():
    try:
        df, last_refresh = load_data()
        kpi = calculate_kpi(df)

        return render_template(
            "search.html",
            last_refresh=last_refresh,
            kpi=kpi
        )

    except Exception as e:
        return str(e)


# -----------------------------------
# Search Issues API
# -----------------------------------
@search_bp.route(
    "/search/issues",
    methods=["POST"]
)
def search_issues():
    try:
        data = request.json
        query = data.get(
            "query",
            ""
        )

        df, _ = load_data()

        filtered = apply_search(
            df,
            query
        )

        filtered = filtered.fillna("")

        results = []

        for _, row in filtered.iterrows():

            source = row.get(
                "Source",
                ""
            )

            number = str(
                row.get(
                    "Number",
                    ""
                )
            )

            # -----------------------------
            # external links
            # -----------------------------
            if source == "SNOW":
                url = (
                    "https://volvoitsm.service-now.com/"
                    f"nav_to.do?uri=incident.do?"
                    f"sysparm_query=number={number}"
                )

            elif source == "PTC":
                url = (
                    "https://support.ptc.com/"
                    f"appserver/cs/view/"
                    f"case.jsp?n={number}"
                )

            elif source == "AZURE":
                url = (
                    "https://dev.azure.com/"
                    "VolvoGroup-DVP/"
                    "VCEWindchillPLM/"
                    f"_workitems/edit/{number}"
                )

            else:
                url = ""

            results.append({
                "number": number,
                "description": row.get(
                    "Description",
                    ""
                ),
                "priority": row.get(
                    "Priority",
                    ""
                ),
                "status": row.get(
                    "Status",
                    ""
                ),
                "created_by": row.get(
                    "Created By",
                    ""
                ),
                "created_date": str(
                    row.get(
                        "Created Date",
                        ""
                    )
                ),
                "assigned_to": row.get(
                    "Assigned To",
                    ""
                ),
                "resolved_date": str(
                    row.get(
                        "Resolved Date",
                        ""
                    )
                ),
                "source": source,
                "url": url
            })

        return jsonify({
            "results": results
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })