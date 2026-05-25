from modules.operations_center.ops_center_data_loader import (
    load_support_mails,
    load_integration_failures,
    load_incident_tracker
)

from modules.operations_center.ops_center_incident_engine import (
    detect_critical_failures
)


def get_operations_dashboard_data():

    # ---------------------------------
    # LOAD DATA
    # ---------------------------------

    support_data = load_support_mails()

    failure_data = load_integration_failures()

    incident_data = load_incident_tracker()

    # ---------------------------------
    # PENDING ACTIONS
    # ---------------------------------

    pending_actions = len([

        row for row in support_data

        if "Action Required"
        in str(
            row.get(
                "Categories",
                ""
            )
        )

    ])

    # ---------------------------------
    # CRITICAL SERVER DETECTION
    # ---------------------------------

    critical_servers = (
        detect_critical_failures(
            failure_data
        )
    )

    # ---------------------------------
    # SUMMARY
    # ---------------------------------

    summary = {

        "support_count": len(
            support_data
        ),

        "failure_count": len(
            failure_data
        ),

        "pending_actions": pending_actions,

        "critical_servers": len(
            critical_servers
        )

    }

    # ---------------------------------
    # FINAL RESPONSE
    # ---------------------------------

    return {

        "support_data": support_data,

        "failure_data": failure_data,

        "incident_data": incident_data,

        "summary": summary

    }