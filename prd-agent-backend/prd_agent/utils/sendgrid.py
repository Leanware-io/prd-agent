import base64
import traceback
from typing import BinaryIO, Dict, List, Optional, Union

import sendgrid
from django.conf import settings

sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    attachments: Optional[List[Dict[str, Union[str, BinaryIO]]]] = None,
) -> bool:
    """
    Send an email with optional attachments, CC, and BCC recipients.

    Args:
        to_email: Email address of the primary recipient
        subject: Email subject line
        html_content: Email body content in HTML format (optional)
        attachments: List of attachment dictionaries with format:
                     [{"filename": "example.pdf", "content": file_object_or_content,
                       "type": "application/pdf"}]

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        from_email = settings.EMAIL_SENDER
        from_name = "Leanware PRD Agent"
        personalization = {"to": [{"email": to_email}], "subject": subject}

        email_content = [{"type": "text/html", "value": html_content}]

        data = {
            "personalizations": [personalization],
            "from": {"email": from_email, "name": from_name},
            "content": email_content,
        }

        if attachments:
            data["attachments"] = []
            for attachment in attachments:
                try:
                    if hasattr(attachment["content"], "read"):
                        file_content = attachment["content"].read()
                    else:
                        file_content = attachment["content"]

                    if isinstance(file_content, str):
                        encoded_content = base64.b64encode(
                            file_content.encode()
                        ).decode()
                    else:
                        encoded_content = base64.b64encode(file_content).decode()

                    data["attachments"].append(
                        {
                            "filename": attachment["filename"],
                            "content": encoded_content,
                            "type": attachment.get("type", "application/octet-stream"),
                            "disposition": attachment.get("disposition", "attachment"),
                        }
                    )
                except (KeyError, TypeError, base64.binascii.Error) as e:
                    print(f"Error processing attachment: {str(e)}")
                    return False

        response = sg.client.mail.send.post(request_body=data)
        return 200 <= response.status_code < 300

    except sendgrid.SendGridException as error:
        print(f"SendGrid API error: {str(error)}")
    except (ValueError, KeyError) as error:
        print(f"Error in email data preparation: {str(error)}")
    except ConnectionError as error:
        print(f"Connection error to SendGrid API: {str(error)}")

    print(traceback.format_exc())
    return False
