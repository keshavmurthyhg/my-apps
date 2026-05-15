@search_bp.route("/search/issues", methods=["POST"])
def search_issues():
    data = request.json
    query = data.get("query")

    results = search_service.search_tickets(query)

    return jsonify({
        "results": results
    })

@app.route("/search/issues", methods=["POST"])
def search_issues():
    try:
        from modules.search.data_loader import load_data
        from modules.search.search import apply_search

        data = request.json
        query = data.get("query", "")

        df, _ = load_data()

        filtered = apply_search(df, query)

        filtered = filtered.fillna("")

        results = []

        for _, row in filtered.iterrows():
            source = row.get("Source", "")
            number = str(row.get("Number", ""))

            if source == "SNOW":
                url = f"https://volvoitsm.service-now.com/nav_to.do?uri=incident.do?sysparm_query=number={number}"
            elif source == "PTC":
                url = f"https://support.ptc.com/appserver/cs/view/case.jsp?n={number}"
            elif source == "AZURE":
                url = f"https://dev.azure.com/VolvoGroup-DVP/VCEWindchillPLM/_workitems/edit/{number}"
            else:
                url = ""

            results.append({
                "number": number,
                "description": row.get("Description", ""),
                "priority": row.get("Priority", ""),
                "status": row.get("Status", ""),
                "created_by": row.get("Created By", ""),
                "created_date": str(row.get("Created Date", "")),
                "assigned_to": row.get("Assigned To", ""),
                "resolved_date": str(row.get("Resolved Date", "")),
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