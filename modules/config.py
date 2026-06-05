# =====================================================
#  OPS PLATFORM — CENTRAL CONFIG
# =====================================================
#
#  Data Source Switches
#  --------------------
#  Set USE_*_API = True  → live API call
#  Set USE_*_API = False → local Excel/CSV file
#
#  ServiceNow and PTC are off by default because
#  corporate firewall blocks direct API access.
#  Flip to True when access is granted.
#
#  Azure is on by default — PAT auth works fine.
# =====================================================

ENV = "DEV"
from dotenv import load_dotenv
import os

load_dotenv()

# ─────────────────────────────────────────────
#  DATA SOURCE TOGGLES
# ─────────────────────────────────────────────

USE_SNOW_API  = False   # True = live SNOW REST API
USE_AZURE_API = True    # True = live Azure DevOps API  ← working
USE_PTC_API   = False   # True = live PTC REST API

# ─────────────────────────────────────────────
#  SERVICENOW
#  When USE_SNOW_API = True, these are used.
#  Auth: Basic (username + password)
# ─────────────────────────────────────────────

SNOW_INSTANCE  = "https://volvoitsm.service-now.com/"          # => volvoitsm.service-now.com
SNOW_USERNAME  = "keshavamurthy.hg@consultant.volvo.com"                   # your SNOW username
SNOW_PASSWORD = os.getenv("SNOW_PASSWORD")            # your SNOW password (or use env var)

# ─────────────────────────────────────────────
#  AZURE DEVOPS
#  When USE_AZURE_API = True, these are used.
#  Auth: Personal Access Token (PAT)
# ─────────────────────────────────────────────

AZURE_ORG      = "VolvoGroup-DVP"
AZURE_PROJECT  = "VCEWindchillPLM"
AZURE_PAT      = os.getenv("AZURE_PAT")                   # paste your PAT here

# ─────────────────────────────────────────────
#  PTC
#  When USE_PTC_API = True, these are used.
#  Auth: Basic (username + password / API key)
# ─────────────────────────────────────────────

PTC_BASE_URL   = "https://support.ptc.com"
PTC_USERNAME   = "keshavamurthy.hg@consultant.volvo.com"
PTC_PASSWORD  = os.getenv("PTC_PASSWORD")

# ─────────────────────────────────────────────
#  FALLBACK LOCAL FILES
#  Used when API toggle is False
# ─────────────────────────────────────────────

SNOW_EXCEL_PATH = "data/Snow.xlsx"
AZURE_CSV_PATH  = "data/Azure.csv"
PTC_CSV_PATH    = "data/PTC.csv"

# ─────────────────────────────────────────────
#  TRACKER USERS  (shared across all loaders)
# ─────────────────────────────────────────────

TRACKER_USERS = [
    "pradnya",
    "surendra",
    "suram",
    "ramesh",
    "keshava",
]
