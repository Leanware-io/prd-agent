"""Google Cloud Storage utilities for Django"""
import base64
from datetime import datetime, timedelta, timezone

from django.conf import settings
from google.cloud import storage


def upload_to_gcs(base64_pdf: str, session_key: str):
    """
    Upload a base64 encoded PDF to Google Cloud Storage and return a presigned URL
    Args:
        base64_pdf (str): Base64 encoded PDF content
        session_key (str): Unique session identifier
    Returns:
        tuple: (str, str) Presigned URL for the uploaded file and filename
    """
    # Initialize GCS client
    storage_client = storage.Client()
    bucket = storage_client.bucket(settings.PRD_BUCKET)

    # Generate unique filename
    filename = (
        f"prd_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{session_key}.pdf"
    )
    blob = bucket.blob(filename)

    # Decode and upload the PDF
    pdf_content = base64.b64decode(base64_pdf)
    blob.upload_from_string(pdf_content, content_type="application/pdf")

    # Generate signed URL that expires in 1 hour
    url = blob.generate_signed_url(
        version="v4", expiration=timedelta(hours=1), method="GET"
    )

    return {
        "filename": filename,
        "presigned_url": url,
    }
