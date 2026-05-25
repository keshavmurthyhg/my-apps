import os
import time

import pythoncom
import win32com.client as win32


DATA_FILE = os.path.join(
    "data",
    "operations_tracker.xlsx"
)


def refresh_power_query():

    try:

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

        return {
            "success": True,
            "message": "Power Query refreshed successfully"
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }