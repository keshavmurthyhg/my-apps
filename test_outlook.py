from modules.operations_center.outlook_email_collector import get_support_emails
from modules.operations_center.list_mailboxes import pythoncom.CoInitialize


df = get_support_emails(20)

print(df.head())

pythoncom.CoInitialize()

outlook = win32com.client.Dispatch(
    "Outlook.Application"
).GetNamespace("MAPI")

print("\nMAILBOXES\n")

for i in range(outlook.Folders.Count):
    folder = outlook.Folders.Item(i + 1)

    print(
        f"{i+1} : {folder.Name}"
    )