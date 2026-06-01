import pythoncom
import win32com.client

pythoncom.CoInitialize()

outlook = win32com.client.Dispatch(
    "Outlook.Application"
).GetNamespace("MAPI")

mailbox = outlook.Folders["Support vce.windchill.2nd"]

print("Mailbox:", mailbox.Name)

for i in range(mailbox.Folders.Count):
    folder = mailbox.Folders.Item(i + 1)
    print(folder.Name)