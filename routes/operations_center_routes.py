from flask import (
    Blueprint,
    render_template,
    jsonify
)

from modules.operations_center.ops_center_excel_refresh import (
    refresh_power_query
)

from modules.operations_center.ops_center_service import (
    get_operations_dashboard_data
)

import pandas as pd
import os
from pathlib import Path

operations_center_bp = Blueprint(
    "operations_center",
    __name__
)

DATA_FILE = os.path.join(
    "data",
    "operations_tracker.xlsx"
)


from modules.operations_center.ops_support_email_collector import (
    get_support_emails
)

from modules.operations_center.ops_integration_failure_collector import (
    get_integration_failures
)

@operations_center_bp.route("/operations-center")
def operations_center():

    dashboard_data = (
        get_operations_dashboard_data()
    )

    return render_template(
        "operations_center.html",

        support_data=
            dashboard_data["support_data"],

        failure_data=
            dashboard_data["failure_data"],

        incident_data=
            dashboard_data["incident_data"],

        azure_data=
            dashboard_data["azure_data"],

        ptc_data=
            dashboard_data["ptc_data"],

        summary=
            dashboard_data["summary"]
    )

@operations_center_bp.route(
    "/api/operations-center/refresh"
)
def refresh_operations_data():

    dashboard_data = (
        get_operations_dashboard_data()
    )

    return jsonify({

        "success": True,

        "support_data":
            dashboard_data["support_data"],

        "failure_data":
            dashboard_data["failure_data"],

        "incident_data":
            dashboard_data["incident_data"],

        "azure_data":
            dashboard_data["azure_data"],

        "ptc_data":
            dashboard_data["ptc_data"],

        "summary":
            dashboard_data["summary"]
    })

@operations_center_bp.route(
    "/api/operations-center/refresh-power-query"
)
def refresh_power_query_route():

    result = refresh_power_query()

    return jsonify(result)


@operations_center_bp.route(
    "/api/refresh-status"
)
def get_refresh_status():

    status_file = Path(
        "data/refresh_status.txt"
    )

    if status_file.exists():

        return jsonify({
            "last_refresh":
                status_file.read_text(
                    encoding="utf-8"
                ).strip()
        })

    return jsonify({
        "last_refresh":
            "Never"
    })

@operations_center_bp.route(
    "/api/operations-center/support-emails"
)
def support_emails_api():

    try:

        data = get_support_emails(500)

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })


@operations_center_bp.route(
    "/api/operations-center/integration-failures"
)
def integration_failures_api():

    try:

        data = get_integration_failures(500)

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })