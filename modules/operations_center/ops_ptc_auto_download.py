import os
import time
import shutil
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options


PTC_URL = "https://www.ptc.com/en/support/cstracker/casetracker#"

TARGET_FILE = r"C:\Users\a447927\Desktop\my-apps\data\PTC_Cases_Report.csv"

EDGE_DRIVER = (
    r"C:\Users\a447927\Desktop\my-apps\drivers\msedgedriver.exe"
)


def download_latest_ptc_csv():

    driver = None

    try:

        print("\n===================================")
        print("STARTING PTC AUTO DOWNLOAD")
        print("===================================\n")

        # --------------------------------------------------
        # CONNECT TO EXISTING EDGE DEBUG SESSION
        # --------------------------------------------------

        edge_options = Options()

        edge_options.add_experimental_option(
            "debuggerAddress",
            "127.0.0.1:9222"
        )

        service = Service(EDGE_DRIVER)

        driver = webdriver.Edge(
            service=service,
            options=edge_options
        )

        driver.maximize_window()

        # --------------------------------------------------
        # OPEN CASE TRACKER
        # --------------------------------------------------

        print("Opening Case Tracker...")

        driver.get(PTC_URL)

        time.sleep(15)

        # --------------------------------------------------
        # CLICK MY COMPANY
        # --------------------------------------------------

        print("Selecting My Company...")

        my_company = driver.find_element(
            By.XPATH,
            "//*[contains(text(),'My Company')]"
        )

        my_company.click()

        time.sleep(8)

        # --------------------------------------------------
        # EXPORT RESULTS
        # --------------------------------------------------

        print("Opening Export Results...")

        export_button = driver.find_element(
            By.XPATH,
            "//*[contains(text(),'Export results')]"
        )

        export_button.click()

        time.sleep(5)

        # --------------------------------------------------
        # SELECT CSV
        # --------------------------------------------------

        print("Selecting CSV option...")

        csv_tab = driver.find_element(
            By.XPATH,
            "//*[contains(text(),'CSV')]"
        )

        csv_tab.click()

        time.sleep(3)

        # --------------------------------------------------
        # DOWNLOAD CSV
        # --------------------------------------------------

        print("Downloading CSV...")

        download_button = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Download')]"
        )

        download_button.click()

        # --------------------------------------------------
        # WAIT FOR DOWNLOAD
        # --------------------------------------------------

        time.sleep(10)

        downloads_path = Path.home() / "Downloads"

        csv_files = list(downloads_path.glob("*.csv"))

        if not csv_files:
            raise Exception("No CSV files found in Downloads folder")

        latest_csv = max(
            csv_files,
            key=lambda f: f.stat().st_mtime
        )

        print(f"\nDownloaded File:\n{latest_csv}")

        # --------------------------------------------------
        # COPY TO DATA FOLDER
        # --------------------------------------------------

        shutil.copy2(
            latest_csv,
            TARGET_FILE
        )

        print(f"\nUpdated File:\n{TARGET_FILE}")

        # --------------------------------------------------
        # CLOSE DRIVER
        # --------------------------------------------------

        driver.quit()

        print("\n===================================")
        print("PTC DOWNLOAD COMPLETED")
        print("===================================\n")

        return True

    except Exception as e:

        print("\n===================================")
        print(f"PTC DOWNLOAD ERROR: {e}")
        print("===================================\n")

        try:

            if driver:
                driver.quit()

        except:
            pass

        return False