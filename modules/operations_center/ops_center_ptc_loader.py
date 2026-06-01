import pandas as pd

from modules.common.utils.parsers import (
    clean_person_name,
    format_tracker_date,
    normalize_priority
)

TRACKER_USERS = [
    "pradnya",
    "surendra",
    "suram",
    "ramesh",
    "keshava",
   
]

ACTIVE_STATES = [
    "new",
    "active",
    "approved",
    "committed",
    "in progress",
    "on hold",
    "information received",
    "spr filed"
]


def load_ptc_tracker():

    try:

        # --------------------------------------------------
        # LOAD FILE
        # --------------------------------------------------

        df = pd.read_csv(
            "data/PTC.csv",
            encoding="utf-8-sig",
            index_col=False,
            low_memory=False
        )

        # --------------------------------------------------
        # DEBUGGING OUTPUT
        # --------------------------------------------------

        #print("\nRAW HEAD")
        #print(df.head(3).to_string())

        #print("\nRAW FIRST COLUMN")
        #print(df.iloc[:, 0].head(10).tolist())

        #print("\nRAW SECOND COLUMN")
        #print(df.iloc[:, 1].head(10).tolist())

        #print("\n==============================")
        #print("RAW SHAPE")
        #print("==============================")
        #print(df.shape)

        #print("\n==============================")
        #print("RAW COLUMNS")
        #print("==============================")
        #print(df.columns.tolist())

        #print("\n==============================")
        #print("FIRST ROW")
        #print("==============================")

        #if len(df) > 0:
        #    print(df.iloc[0].to_dict())

        # --------------------------------------------------
        # NORMALIZE COLUMNS
        # --------------------------------------------------

        df.columns = (
            df.columns
            .astype(str)
            .str.replace("\ufeff", "", regex=False)
            .str.replace("ï»¿", "", regex=False)
            .str.strip()
            .str.lower()
        )

        #print("\n==============================")
        #print("NORMALIZED COLUMNS")
        #print("==============================")
        #print(df.columns.tolist())

        # --------------------------------------------------
        # DEBUG COLUMN CONTENT
        # --------------------------------------------------

        #debug_cols = [
         #   "case number",
         #   "case contact",
          #  "case assignee",
         #   "status",
          #  "subject",
         #   "severity",
        #    "created date"
        #]

        #for col in debug_cols:

        #    if col in df.columns:

         #       print(f"\n===== {col.upper()} =====")
#
          #      try:
          #          print(
          #              df[col]
          #              .dropna()
         #               .astype(str)
         #               .head(10)
         #               .tolist()
          #          )
          #      except Exception as ex:
          #          print(ex)

        # --------------------------------------------------
        # ENSURE COLUMNS EXIST
        # --------------------------------------------------

        required_columns = [
            "case number",
            "subject",
            "case assignee",
            "case contact",
            "status",
            "severity",
            "created date"
        ]

        for col in required_columns:

            if col not in df.columns:
                df[col] = ""

        # --------------------------------------------------
        # CLEAN VALUES
        # --------------------------------------------------

        for col in required_columns:

            df[col] = (
                df[col]
                .fillna("")
                .astype(str)
                .str.strip()
            )

        # --------------------------------------------------
        # FILTER TRACKER USERS
        # SAME LOGIC AS SEARCH
        # --------------------------------------------------

        #before_user_filter = len(df)

        df = df[
            df["case contact"]
            .str.lower()
            .apply(
                lambda x: any(
                    user in x
                    for user in TRACKER_USERS
                )
            )
        ]

        #print(
            #f"\nRows after user filter: {len(df)} "
           # f"(before={before_user_filter})"
        #)

        # --------------------------------------------------
        # FILTER ACTIVE CASES
        # --------------------------------------------------

        #before_status_filter = len(df)

        df = df[
            df["status"]
            .str.lower()
            .str.strip()
            .isin(ACTIVE_STATES)
        ]

        #print(
         #   f"Rows after status filter: {len(df)} "
          #  f"(before={before_status_filter})"
        #)

        # --------------------------------------------------
        # BUILD OUTPUT
        # --------------------------------------------------

        ptc_df = pd.DataFrame({

            "Number":
                df["case number"],

            "Vendor Ticket":
                "",

            "Description":
                df["subject"],

            "Assigned To":
                df["case assignee"]
                .apply(clean_person_name),

            "Status":
                df["status"],

            "Priority":
                df["severity"]
                .apply(normalize_priority),

            "Created By":
                df["case contact"]
                .apply(clean_person_name),

            "Created Date":
                df["created date"]
                .apply(format_tracker_date)

        })

        ptc_df = ptc_df.fillna("")

        print("\n==============================")
        print(f"PTC Tracker Rows: {len(ptc_df)}")
        print("==============================")

        return ptc_df.to_dict(
            orient="records"
        )

    except Exception as e:

        print(
            f"\nPTC Tracker Load Error: {e}"
        )

        return []