Report-app startup flow:

cd D:\my-app\report-app
.\venv\Scripts\activate
python app.py

Fix it step by step
1) Check if Python exists

Run:

py --version

or

python --version

If both fail → install Python.

2) Install Python properly

Download Python from:

Python official website

While installing:

✅ Check "Add Python to PATH"
✅ Choose Install Now

This is the step most people miss.

3) Disable Microsoft Store alias (if needed)

Your screenshot shows:

"run without arguments to install from Microsoft Store"

Disable that shortcut:

Settings → Apps → Advanced App Settings → App Execution Aliases

Turn OFF:

python.exe
python3.exe
4) Restart PowerShell

Close PowerShell completely and reopen it.

Then verify:

python --version
pip --version

You should see version numbers.

5) Create virtual environment

Inside your project folder:

python -m venv venv
6) Activate virtual environment

In PowerShell:

.\venv\Scripts\Activate

If PowerShell blocks scripts:

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Then run activation again.

7) Install Flask
pip install flask
Full correct flow
python --version
python -m venv venv
.\venv\Scripts\Activate
pip install flask

8) Install pandas inside your active venv:

pip install pandas

pip install python-docx openpyxl reportlab pillow requests

pip install streamlit


Converter
"""""""""
pip install python-pptx python-docx pdf2image pillow

pip install python-pptx 
pip install pdf2image
pip install python-docx

#############-----------------------------------------##############################

Backup or sync with GITHUB
""""""""""""""""""""""""""

Typical workflow after you change code locally:
#See what changed.
git status

#Stage changes.
git add .

#Save changes locally.
git commit -m "Describe what changed"

#Upload changes to GitHub.
git push

#To pull changes from GitHub to another machine
git pull