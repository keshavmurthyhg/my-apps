import pythoncom
import win32com.client

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