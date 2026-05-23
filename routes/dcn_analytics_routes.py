from flask import (
    Blueprint,
    render_template,
    jsonify
)

from modules.dcn_analytics.services.dashboard_service import (
    load_dashboard_data
)

dcn_analytics_bp = Blueprint(
    "dcn_analytics",
    __name__
)


# =========================================================
# PAGE
# =========================================================
@dcn_analytics_bp.route(
    "/dcn-analytics"
)
def dcn_analytics_page():

    return render_template(
        "dcn_analytics.html"
    )


# =========================================================
# DASHBOARD API
# =========================================================
@dcn_analytics_bp.route(
    "/api/dcn-analytics/dashboard"
)
def dashboard_api():

    try:

        result = load_dashboard_data()

        return jsonify(result)

    except Exception as error:

        return jsonify({

            "success": False,

            "message": str(error)

        })