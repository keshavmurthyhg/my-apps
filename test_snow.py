import requests
from requests.auth import HTTPBasicAuth

url = (
    "https://volvoitsm.service-now.com"
    "/api/now/table/incident"
)

response = requests.get(
    url,
    auth=HTTPBasicAuth(
        "a447927",
        "Xperia@Feb2026"
    ),
    headers={
        "Accept": "application/json"
    }
)

print("STATUS:")
print(response.status_code)

print("\nHEADERS:")
print(response.request.headers)

print("\nTEXT:")
print(response.text)

