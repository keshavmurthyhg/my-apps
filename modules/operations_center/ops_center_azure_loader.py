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
    "new",
    "active",
    "approved",
    "committed",
    "in progress",
    "on hold"
]


def load_azure_tracker():

    try:

        df = pd.read_csv(
            "data/Azure.csv"
        )

        df.columns = (
            df.columns
            .astype(str)
            .str.strip()
            .str.lower()
        )

        required = [
            "created by",
            "assigned to",
            "state",
            "release_windchill",
            "created date"
        ]

        for col in required:

            if col not in df.columns:
                df[col] = ""

            df[col] = (
                df[col]
                .fillna("")
                .astype(str)
            )

        # -----------------------------
        # FILTER CREATED BY
        # -----------------------------

        df = df[
            df["created by"]
            .str.lower()
            .apply(
                lambda x: any(
                    user in x
                    for user in TRACKER_USERS
                )
            )
        ]

        # -----------------------------
        # FILTER STATUS
        # -----------------------------

        df = df[
            df["state"]
            .str.strip()
            .str.lower()
            .isin(ACTIVE_STATES)
        ]

        azure_df = pd.DataFrame({

            "Number":
                df.get("id", ""),

            "Vendor Ticket":
                "",

            "Description":
                df.get("title", ""),

            "Assigned To":
                df.get("assigned to", "")
                .apply(clean_person_name),

            "Status":
                df.get("state", ""),

            "Priority":
                df.get("release_windchill", "")
                .fillna(""),

            "Created By":
                df.get("created by", "")
                .apply(clean_person_name),

            "Created Date":
                df.get("created date", "")
                .apply(format_tracker_date)
        })

        azure_df = azure_df.fillna("")

        print(
            "Azure Tracker Rows:",
            len(azure_df)
        )

        return azure_df.to_dict(
            orient="records"
        )

    except Exception as e:

        print(
            f"Azure Tracker Load Error: {e}"
        )

        return []