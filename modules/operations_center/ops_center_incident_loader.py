import pandas as pd

from modules.common.utils.parsers import (
    clean_person_name,
    format_tracker_date
)

TRACKER_USERS = [
    "pradnya",
    "surendra",
    "suram",
    "ramesh",
    "keshava"
]


ACTIVE_STATES = [
    "on hold",
    "in progress"
]

def normalize_columns(df):

    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
        .str.lower()
    )

    return df


def get_column(df, *names):

    for name in names:

        if name in df.columns:
            return df[name]

    return pd.Series([""] * len(df))


def load_incident_tracker():

    try:

        snow = pd.read_excel(
            "data/Snow.xlsx",
            engine="openpyxl"
        )

    except Exception as e:

        print(
            f"Incident tracker load failed: {e}"
        )

        return []

    snow = normalize_columns(
        snow
    )

    # ---------------------------------------
    # DEBUG OUTPUT
    # ---------------------------------------

    #if "incident state" in snow.columns:

    #    print(
    #        "\nAvailable Incident States:"
    #    )

     #   print(
     #       snow["incident state"]
     #       .dropna()
     #       .astype(str)
     #       .unique()
     #   )

    #if "assigned to" in snow.columns:

    #    print(
    #        "\nAvailable Assigned To:"
     #   )

     #   print(
     #       snow["assigned to"]
     #       .dropna()
     #       .astype(str)
     #       .unique()
     #   )

    # ---------------------------------------
    # BUILD INCIDENT DATAFRAME
    # ---------------------------------------

    incident_df = pd.DataFrame({

        "Number":
            get_column(
                snow,
                "number"
            ),

        "Vendor Ticket":
            get_column(
                snow,
                "vendor ticket",
                "vendor incident",
                "vendor reference",
                "external ticket"
            ),

        "Description":
            get_column(
                snow,
                "short description",
                "description"
            ),

        "Assigned To":
            get_column(
                snow,
                "assigned to"
            ),

        "Status":
            get_column(
                snow,
                "incident state"
            ),

        "Priority":
            get_column(
                snow,
                "priority"
            ),
        "Created By":
            "",

        "Created Date":
            get_column(
                snow,
                "created",
                "opened",
                "opened at",
                "created date",
                "date"
            ).apply(format_tracker_date)
    })

    incident_df = (
        incident_df
        .fillna("")
    )

    # ---------------------------------------
    # FILTER STATUS
    # ---------------------------------------

    incident_df = incident_df[
        incident_df["Status"]
        .astype(str)
        .str.lower()
        .str.strip()
        .isin(ACTIVE_STATES)
    ]

    # ---------------------------------------
    # FILTER ASSIGNED USERS
    # ---------------------------------------

    incident_df = incident_df[
        incident_df["Assigned To"]
        .astype(str)
        .str.lower()
        .apply(
            lambda x: any(
                user in x
                for user in TRACKER_USERS
            )
        )
    ]

    # ---------------------------------------
    # SORT NEWEST FIRST
    # ---------------------------------------

    try:

        incident_df["_sort_date"] = pd.to_datetime(
            incident_df["Created Date"],
            errors="coerce"
        )

        incident_df = incident_df.sort_values(
            by="_sort_date",
            ascending=False
        )

        incident_df.drop(
            columns=["_sort_date"],
            inplace=True
        )

        incident_df["Created Date"] = (
            incident_df["Created Date"]
            .apply(format_tracker_date)
        )

        incident_df["Created Date"] = (
            incident_df["Created Date"]
            .replace("NaT", "")
            .replace("nan", "")
        )
        
    except Exception:

        pass

    # ---------------------------------------
    # DEBUG COUNTS
    # ---------------------------------------

    print(
        "\nSNOW Rows:",
        len(snow)
    )

    print(
        "Incident Rows:",
        len(incident_df)
    )

    # ---------------------------------------
    # RETURN DATA
    # ---------------------------------------

    return incident_df.to_dict(
        orient="records"
    )