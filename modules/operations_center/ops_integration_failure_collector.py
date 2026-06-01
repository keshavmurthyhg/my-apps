import pythoncom
import win32com.client


def get_integration_failures(limit=500):

    pythoncom.CoInitialize()

    outlook = (
        win32com.client.Dispatch(
            "Outlook.Application"
        )
        .GetNamespace("MAPI")
    )

    mailbox = outlook.Folders[
        "keshavamurthy.hg@consultant.volvo.com"
    ]

    inbox = mailbox.Folders["Inbox"]

    failure_folder = inbox.Folders[
        "Integration Failure"
    ]

    messages = failure_folder.Items

    messages.Sort(
        "[ReceivedTime]",
        True
    )

    rows = []

    count = 0

    for msg in messages:

        try:

            rows.append({

                "Failure Time":
                    msg.ReceivedTime.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),

                "Subject":
                    str(msg.Subject),

                "Sender":
                    str(msg.SenderName),

                "Categories":
                    str(msg.Categories or "")
            })

            count += 1

            if count >= limit:
                break

        except Exception:
            continue

    return rows