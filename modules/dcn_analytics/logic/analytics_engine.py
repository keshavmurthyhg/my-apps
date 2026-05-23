import re
import pandas as pd

from modules.common.utils.parsers import (
    clean_empty_values
)


# =========================================================
# PREPARE DATAFRAME
# =========================================================
def prepare_dataframe(df):

    df.columns = [
        str(col).strip()
        for col in df.columns
    ]

    df = clean_empty_values(df)

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

    # =====================================================
    # CLEAN TYPE COLUMN
    # =====================================================
    df["Object Type Indicator"] = (

        df["Object Type Indicator"]

        .fillna("")

        .astype(str)

        .str.strip()

        .str.lower()

    )

    # =====================================================
    # FILTER ONLY DCN
    # =====================================================
    df = df[

        df["Object Type Indicator"]

        .str.contains(
            "design change notice",
            case=False,
            na=False
        )

    ].copy()

    # =====================================================
    # EMPTY CHECK
    # =====================================================
    if df.empty:

        return pd.DataFrame(columns=[

            "Date",

            "Total DCNs",

            "Sequence Skipped",

            "Skipped DCN Numbers"

        ])

    # =====================================================
    # CLEAN CREATED ON
    # =====================================================
    df["Created On"] = (

        df["Created On"]

        .astype(str)

        .str.replace(
            "CEST",
            "",
            regex=False
        )

        .str.strip()

    )

    # =====================================================
    # DATE PARSE
    # =====================================================
    df["Created Date"] = pd.to_datetime(

        df["Created On"],

        format="%Y-%m-%d %H:%M",

        errors="coerce"

    )

    # =====================================================
    # REMOVE INVALID DATES
    # =====================================================
    df = df.dropna(
        subset=["Created Date"]
    )

    # =====================================================
    # CONVERT DATE
    # =====================================================
    df["Created Date"] = (
        pd.to_datetime(
            df["Created Date"]
        ).dt.date
    )

    # =====================================================
    # NUMERIC DCN
    # =====================================================
    df["Numeric DCN"] = df["Number"].apply(
        extract_numeric_dcn
    )

    # =====================================================
    # REMOVE EMPTY NUMBERS
    # =====================================================
    df = df.dropna(
        subset=["Numeric DCN"]
    )

    # =====================================================
    # EMPTY AFTER CLEAN
    # =====================================================
    if df.empty:

        return pd.DataFrame(columns=[

            "Date",

            "Total DCNs",

            "Sequence Skipped",

            "Skipped DCN Numbers"

        ])

    # =====================================================
    # GROUP DAILY
    # =====================================================
    summary_rows = []

    grouped = df.groupby(
        "Created Date"
    )

    for created_date, group in grouped:

        numbers = sorted(

            [
                int(x)
                for x in group["Numeric DCN"].unique()
            ]

        )

        missing = []

        for current, next_num in zip(
            numbers,
            numbers[1:]
        ):

            if next_num - current > 1:

                for value in range(
                    current + 1,
                    next_num
                ):

                    missing.append(value)

        if pd.isna(created_date):
            continue

        summary_rows.append({

            "Date":
                pd.to_datetime(
                    created_date
                ).strftime("%d-%b-%Y"),

            "Total DCNs":
                int(len(numbers)),

            "Sequence Skipped":
                int(len(missing)),

            "Skipped DCN Numbers":
                ", ".join(
                    [
                        f"{x}WC"
                        for x in missing
                    ]
                )

        })

    # =====================================================
    # FINAL DATAFRAME
    # =====================================================
    summary_df = pd.DataFrame(
        summary_rows
    )

    # =====================================================
    # SORT
    # =====================================================
    if not summary_df.empty:

        summary_df["DateObj"] = pd.to_datetime(

            summary_df["Date"],

            format="%d-%b-%Y",

            errors="coerce"

        )

        summary_df = summary_df.sort_values(
            by="DateObj"
        )

        summary_df = summary_df.drop(
            columns=["DateObj"]
        )

    return summary_df


# =========================================================
# BUILD MONTHLY CHART DATA
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

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

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

    datasets = []

    for year in pivot_df.columns:

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
# BUILD MONTHLY PIVOT TABLE
# =========================================================
def build_monthly_pivot(summary_df):

    if summary_df.empty:
        return []

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

    pivot_df = pd.pivot_table(

        summary_df,

        index="Month",

        columns="Year",

        values="Sequence Skipped",

        aggfunc="sum",

        fill_value=0

    )

    month_order = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

    ]

    pivot_df = pivot_df.reindex(
        month_order,
        fill_value=0
    )

    pivot_df = pivot_df.reset_index()

    return pivot_df.to_dict(
        orient="records"
    )


# =========================================================
# BUILD KPI
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