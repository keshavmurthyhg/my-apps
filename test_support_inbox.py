import pythoncom
import win32com.client
import pandas as pd

pythoncom.CoInitialize()

outlook = win32com.client.Dispatch(
    "Outlook.Application"
).GetNamespace("MAPI")

mailbox = outlook.Folders["Support vce.windchill.2nd"]
inbox = mailbox.Folders["Inbox"]

print("Mailbox:", mailbox.Name)
print("Inbox Count:", inbox.Items.Count)

messages = inbox.Items
messages.Sort("[ReceivedTime]", True)

rows = []

count = 0

for msg in messages:
    try:
        rows.append({
            "Date Received": msg.ReceivedTime.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "Name": msg.SenderName,
            "Subject": msg.Subject,
            "Importance": {
                0: "Low",
                1: "Normal",
                2: "High"
            }.get(msg.Importance, "Normal"),
            "Categories": msg.Categories
        })

        count += 1

        if count >= 20:
            break

    except Exception:
        pass

for row in rows[:10]:
    print(row)

df = pd.DataFrame(rows)
print(df.head(20).to_string())