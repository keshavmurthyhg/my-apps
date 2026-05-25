from flask import (
    Blueprint,
    render_template,
    jsonify
)

import pandas as pd
import os

operations_center_bp = Blueprint(
    "operations_center",
    __name__
)

DATA_FILE = os.path.join(
    "data",
    "operations_tracker.xlsx"
)


@operations_center_bp.route("/operations-center")
def operations_center():

    support_data = []
    failure_data = []

    try:
        if os.path.exists(DATA_FILE):

            support_df = pd.read_excel(
                DATA_FILE,
                sheet_name="Support_Mail"
            )

            failure_df = pd.read_excel(
                DATA_FILE,
                sheet_name="Integration_Failure"
            )

            support_data = support_df.fillna("").to_dict(
                orient="records"
            )

            failure_data = failure_df.fillna("").to_dict(
                orient="records"
            )

    except Exception as e:
        print(f"Operations Center Error: {e}")

    return render_template(
        "operations_center.html",
        support_data=support_data,
        failure_data=failure_data
    )


@operations_center_bp.route(
    "/api/operations-center/refresh-power-query"
)
def refresh_power_query():

    try:

        import win32com.client as win32
        import pythoncom
        import time

        pythoncom.CoInitialize()

        excel = win32.DispatchEx(
            "Excel.Application"
        )

        excel.Visible = False
        excel.DisplayAlerts = False

        workbook_path = os.path.abspath(
            DATA_FILE
        )

        wb = excel.Workbooks.Open(
            workbook_path
        )

        wb.RefreshAll()

        excel.CalculateUntilAsyncQueriesDone()

        time.sleep(5)

        wb.Save()
        wb.Close(False)

        excel.Quit()

        return jsonify({
            "success": True,
            "message": "Power Query refreshed successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })