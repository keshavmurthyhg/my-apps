import requests
import base64

ORGANIZATION = "VolvoGroup-DVP"
PROJECT = "VCEWindchillPLM"

AZURE_PAT = os.getenv("AZURE_PAT")


url = (
    f"https://dev.azure.com/"
    f"{ORGANIZATION}/"
    f"{PROJECT}/"
    "_apis/wit/wiql"
    "?api-version=7.0"
)

query = {
    "query": """
    SELECT
        [System.Id],
        [System.Title],
        [System.State],
        [System.AssignedTo]
    FROM WorkItems
    WHERE
        [System.WorkItemType] = 'Bug'
        AND [System.State] <> 'Closed'
    ORDER BY [System.ChangedDate] DESC
    """
}

pat_token = base64.b64encode(
    f":{AZURE_PAT}".encode()
).decode()

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {pat_token}"
}

response = requests.post(
    url,
    json=query,
    headers=headers,
    timeout=30
)

print("STATUS:")
print(response.status_code)

print("\nRESPONSE:")
print(response.text)
