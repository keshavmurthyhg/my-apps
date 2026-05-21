import pandas as pd



def merge_dataframes(
    old_df,
    new_df,
    key_column,
    latest_logic,
    date_column
):

    key_column = key_column.lower()

    updated_records = []
    new_records = []

    merged_df = old_df.copy()

    existing_keys = set(old_df[key_column].tolist())

    for _, new_row in new_df.iterrows():

        key_value = new_row[key_column]

        if key_value in existing_keys:

            old_row = merged_df[merged_df[key_column] == key_value].iloc[0]

            if not old_row.equals(new_row):

                if latest_logic == 'new_file':

                    merged_df = merged_df[
                        merged_df[key_column] != key_value
                    ]

                    merged_df = pd.concat([
                        merged_df,
                        pd.DataFrame([new_row])
                    ], ignore_index=True)

                    updated_records.append(new_row)

                elif latest_logic == 'date_column' and date_column:

                    try:
                        old_date = pd.to_datetime(old_row[date_column])
                        new_date = pd.to_datetime(new_row[date_column])

                        if new_date > old_date:

                            merged_df = merged_df[
                                merged_df[key_column] != key_value
                            ]

                            merged_df = pd.concat([
                                merged_df,
                                pd.DataFrame([new_row])
                            ], ignore_index=True)

                            updated_records.append(new_row)

                    except:
                        pass

        else:

            merged_df = pd.concat([
                merged_df,
                pd.DataFrame([new_row])
            ], ignore_index=True)

            new_records.append(new_row)

    updated_df = pd.DataFrame(updated_records)
    new_records_df = pd.DataFrame(new_records)

    return merged_df, updated_df, new_records_df
