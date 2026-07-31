"""
This module contains the tools available for LLM agents
"""

import base64
import io
import os

import markdown
from weasyprint import HTML


def markdown_to_pdf_base64(markdown_text_raw, logo_path):
    """
    Converts markdown text to a PDF document with styling and returns it as a base64 encoded string.

    Args:
        markdown_text_raw (str): The raw markdown text to convert to PDF.
        logo_path (str): File path to the logo image to be included in the header.

    Returns:
        str: Base64 encoded string of the generated PDF.
    """
    markdown_text = markdown_text_raw.encode("latin-1", "replace").decode("latin-1")
    html_text = markdown.markdown(markdown_text, extensions=["extra", "codehilite"])
    logo_data_uri = ""
    with open(logo_path, "rb") as image_file:
        encoded_logo = base64.b64encode(image_file.read()).decode("utf-8")
        file_extension = os.path.splitext(logo_path)[1].lower().replace(".", "")
        logo_data_uri = f"data:image/{file_extension};base64,{encoded_logo}"
    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                margin: 2.5cm 1cm 2cm 1cm;
                @top-right {{
                    content: element(header);
                }}
                @bottom-left {{
                    content: element(footer);
                }}
            }}
            #header {{
                position: running(header);
                text-align: right;
            }}
            #header .header-logo {{
                width: 200px;
                height: 55px;
                object-fit: contain;
            }}
            #footer {{
                position: running(footer);
                font-style: italic;
                font-size: 10px;
                color: #808080;
            }}
            #footer a {{
                color: #808080;
                text-decoration: none;
            }}
            body {{
                font-family: 'Arial', sans-serif;
            }}
            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {{
            font-weight: bold;
            margin: 0;
            padding: 0.5em 0;
            }}
            h1 {{
            font-size: 2em;
            }}
            h2 {{
            font-size: 1.75em;
            }}
            h3 {{
            font-size: 1.5em;
            }}
            h4 {{
            font-size: 1.25em;
            }}
            h5 {{
            font-size: 1.1em;
            }}
            h6 {{
            font-size: 1em;
            }}
            p {{
            white-space: break-spaces;
            }}
            p:not(:first-child, :last-child) {{
            margin: 0.5em 0;
            }}
            p:first-child {{
            margin-bottom: 0.5em;
            }}
            p:last-child {{
            margin-top: 0.5em;
            }}
            ol,
            ul {{
            margin: 0.5em 0;
            padding-left: 20px;
            }}
            ul {{
            list-style-type: disc;
            }}
            ol {{
            list-style-type: decimal;
            }}
            strong,
            b {{
            font-weight: bold;
            }}
            em,
            b {{
            font-style: italic;
            }}
            table {{
            box-sizing: border-box;
            background-color: transparent;
            border-collapse: collapse;
            border-spacing: 0;
            max-width: 100%;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            width: auto;
            }}
            thead,
            tbody {{
            border-collapse: collapse;
            border-spacing: 0;
            box-sizing: border-box;
            }}
            table thead th {{
            text-align: left;
            padding: 8px;
            line-height: 1.5;
            vertical-align: bottom;
            border: 1px solid #ddd;
            border-bottom-width: 2px;
            border-top: 0;
            }}
            table tbody td {{
            padding: 8px;
            line-height: 1.5;
            vertical-align: top;
            border: 1px solid #ddd;
            }}
            table tbody tr:nth-child(odd) td {{
            background-color: #f9f9f9;
            }}
        </style>
    </head>
    <body>
        <div id="header">
            <img src="{logo_data_uri}" class="header-logo" alt="Logo">
        </div>
        
        <div id="footer">
            <a href="https://prdagent.leanware.co/">This PRD was generated using the free Leanware PRD Agent - prdagent.leanware.co</a>
        </div>
        
        <div id="content">
            {html_text}
        </div>
    </body>
    </html>
    """
    pdf_buffer = io.BytesIO()
    HTML(string=styled_html).write_pdf(pdf_buffer)
    pdf_buffer.seek(0)
    pdf_base64 = base64.b64encode(pdf_buffer.read()).decode("utf-8")
    return pdf_base64


def pdf_tool_func(inputs: str):
    """
    Function to generate the PRD PDF using the provided input.
    """
    return markdown_to_pdf_base64(inputs, "prd_agent/utils/logo.png")
