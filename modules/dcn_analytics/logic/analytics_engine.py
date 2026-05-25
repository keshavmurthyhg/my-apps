import re
import pandas as pd

from modules.common.utils.parsers import (
    clean_empty_values
)
from modules.dcn_analytics.utils.dcn_parsers import (
    prepare_dcn_dataframe
)

# =========================================================
# PREPARE DATAFRAME
# =========================================================
def prepare_dataframe(df):

    df = prepare_dcn_dataframe(df)

    return df


# =========================================================
# EXTRACT NUMERIC DCN
# =========================================================
def extract_numeric_dcn(value):

    match = re.search(
        r"(\d+)",
        str(value)
    )

    if match:
        return int(match.group(1))

    return None


# =========================================================
# BUILD DAILY SUMMARY
# =========================================================
def build_daily_summary(df):

    missing_rows = []

    for i in range(len(df) - 1):

        current_num = int(df.iloc[i]["DCN_NUM"])
        next_num = int(df.iloc[i + 1]["DCN_NUM"])

        current_date = df.iloc[i]["Created Date"]

        gap = next_num - current_num

        # Ignore duplicates
        if gap <= 1:
            continue

        # Ignore unrealistic jumps
        if gap > 5:
            continue

        missing_numbers = []

        for n in range(
            current_num + 1,
            next_num
        ):
            missing_numbers.append(
                f"{n}WC"
            )

        missing_rows.append({

            "Date":
                current_date.strftime("%d-%b-%Y"),

            "Month":
                current_date.strftime("%b"),

            "Year":
                int(current_date.year),

            "Total DCNs":
                1,

            "Sequence Skipped":
                len(missing_numbers),

            "Skipped DCN Numbers":
                ", ".join(missing_numbers)
        })

    return pd.DataFrame(missing_rows)


# =========================================================
# MONTHLY CHART
# =========================================================
def build_monthly_chart_data(summary_df):

    if summary_df.empty:

        return {

            "labels": [],
            "datasets": []

        }

    summary_df["DateObj"] = pd.to_datetime(

        summary_df["Date"],

        format="%d-%b-%Y",

        errors="coerce"

    )

    summary_df = summary_df.dropna(
        subset=["DateObj"]
    )

    summary_df["Month"] = (
        summary_df["DateObj"]
        .dt.strftime("%b")
    )

    summary_df["Year"] = (
        summary_df["DateObj"]
        .dt.year.astype(str)
    )

    month_order = [

        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"

    ]

    pivot_df = pd.pivot_table(

        summary_df,

        index="Month",

        columns="Year",

        values="Sequence Skipped",

        aggfunc="sum",

        fill_value=0

    )

    pivot_df = pivot_df.reindex(
        month_order,
        fill_value=0
    )

    available_years = sorted(
        pivot_df.columns.tolist()
    )

    
    datasets = []

    for year in available_years:

        datasets.append({

            "label": str(year),

            "data": [

                int(x)
                for x in pivot_df[year].tolist()

            ]

        })

    return {

        "labels": month_order,

        "datasets": datasets

    }


# =========================================================
# MONTHLY PIVOT
# =========================================================
def build_monthly_pivot(summary_df):

    if summary_df.empty:
        return []

    summary_df["DateObj"] = pd.to_datetime(

        summary_df["Date"],

        format="%d-%b-%Y",

        errors="coerce"

    )

    summary_df["Month"] = (
        summary_df["DateObj"]
        .dt.strftime("%b")
    )

    summary_df["Year"] = (
        summary_df["DateObj"]
        .dt.year.astype(str)
    )

    pivot_df = pd.pivot_table(

        summary_df,

        index="Month",

        columns="Year",

        values="Sequence Skipped",

        aggfunc="sum",

        fill_value=0

    )

    month_order = [

        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"

    ]

    pivot_df = pivot_df.reindex(
        month_order,
        fill_value=0
    )

    pivot_df = pivot_df.reset_index()

    # Ensure Month is first column
    ordered_columns = ["Month"] + [

        col for col in pivot_df.columns

        if col != "Month"
    ]

    pivot_df = pivot_df[
        ordered_columns
    ]

    return pivot_df.to_dict(
        orient="records"
    )


# =========================================================
# KPI
# =========================================================
def build_kpi(summary_df):

    if summary_df.empty:

        return {

            "total_missing": 0,
            "current_month": 0,
            "latest_dcn": "-",
            "last_updated": "-"

        }

    total_missing = int(
        summary_df["Sequence Skipped"].sum()
    )

    latest_row = summary_df.iloc[-1]

    current_month = int(
        latest_row["Sequence Skipped"]
    )

    last_updated = latest_row["Date"]

    latest_dcn = latest_row[
        "Skipped DCN Numbers"
    ]

    if latest_dcn == "":
        latest_dcn = "-"

    return {

        "total_missing": total_missing,
        "current_month": current_month,
        "latest_dcn": latest_dcn,
        "last_updated": last_updated

    }