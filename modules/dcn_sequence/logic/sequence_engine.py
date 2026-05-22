import pandas as pd
import re


def extract_dcn_numbers(df):
    """
    Extract numeric DCN values from Number column.
    """

    if 'Number' not in df.columns:
        raise ValueError("'Number' column not found")

    dcn_series = (
        df['Number']
        .astype(str)
        .str.strip()
    )

    numeric_values = []

    for value in dcn_series:
        match = re.search(r'(\d+)', value)

        if match:
            numeric_values.append(int(match.group(1)))

    numeric_values = sorted(set(numeric_values))

    return numeric_values



def find_missing_sequences(numbers):
    """
    Find missing sequence numbers.
    """

    missing = []

    for current, next_num in zip(numbers, numbers[1:]):

        if next_num - current > 1:

            for val in range(current + 1, next_num):
                missing.append(val)

    return missing



def build_missing_dataframe(missing_numbers):
    """
    Build output dataframe.
    """

    output = []

    for idx, number in enumerate(missing_numbers, start=1):

        output.append({
            'SL NO': idx,
            'Missing DCN Number': f'{number}WC',
            'Numeric Value': number
        })

    return pd.DataFrame(output)
