import pandas as pd

from flask import (
    Blueprint,
    render_template,
    request,
    jsonify
)

from modules.search.data_loader import load_data
from modules.search.kpi import calculate_kpi
from modules.search.search import apply_search
from modules.common.utils.parsers import (
    format_display_date
)
from modules.common.utils.links import (
    get_url
)

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
# Filter Options API
# -----------------------------------
@search_bp.route("/search/filter-options")
def search_filter_options():

    try:

        df, _ = load_data()

        status = sorted(
            df["Status"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        priority = sorted(
            df["Priority"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        groups = sorted(
            df["Assigned To"]
            .dropna()
            .astype(str)
            .unique()
            .tolist()
        )

        return jsonify({
            "status": status,
            "priority": priority,
            "groups": groups
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

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

        sources = data.get(
            "sources",
            []
        )

        status = data.get(
            "status",
            ""
        )

        priority = data.get(
            "priority",
            ""
        )

        group = data.get(
            "group",
            ""
        )

        date_field = data.get(
            "date_field",
            "created"
        )

        start_date = data.get(
            "start_date",
            ""
        )

        end_date = data.get(
            "end_date",
            ""
        )

        df, _ = load_data()

        # -----------------------------------
        # SOURCE FILTER
        # -----------------------------------
        if sources:
            df = df[
                df["Source"].isin(sources)
            ]

        # -----------------------------------
        # STATUS FILTER
        # -----------------------------------
        if status:
            df = df[
                df["Status"].astype(str) == status
            ]


        # -----------------------------------
        # PRIORITY FILTER
        # -----------------------------------
        if priority:
            df = df[
                df["Priority"].astype(str) == priority
            ]


        # -----------------------------------
        # GROUP FILTER
        # -----------------------------------
        if group:
            df = df[
                df["Assigned To"].astype(str) == group
            ]

        # -----------------------------------
        # DATE FIELD
        # -----------------------------------
        date_column = (
            "Created Date"
            if date_field == "created"
            else "Resolved Date"
        )


        # -----------------------------------
        # DATE RANGE FILTER
        # -----------------------------------

        if start_date:

            start_date = pd.to_datetime(start_date)

            df = df[
                df[date_column] >= start_date
            ]


        if end_date:

            end_date = pd.to_datetime(end_date)

            df = df[
                df[date_column] <= end_date
            ]

        # -----------------------------------
        # SEARCH
        # -----------------------------------
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
                url = get_url("incident", number)

            elif source == "PTC":
                url = get_url("ptc case", number)

            elif source == "AZURE":
                url = get_url("azure bug", number)

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
                "created_date": format_display_date(
                    row.get("Created Date")
                ),
                "assigned_to": row.get(
                    "Assigned To",
                    ""
                ),
                "resolved_date": format_display_date(
                    row.get("Resolved Date")
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