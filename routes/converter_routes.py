import os
import re

from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    send_file
)

from modules.converter.converted_preview import generate_slide_preview
from modules.converter.converter import convert_ppt
from modules.converter.incident_extractor import extract_incident
from modules.rca.fetch_incident import get_incident_data


converter_bp = Blueprint(
    "converter",
    __name__
)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

# Store preview images temporarily
preview_image_store = {}


# -----------------------------------
# FALLBACK INCIDENT EXTRACTION
# -----------------------------------
def extract_full_incident_from_filename(filename):
    """
    Extract full incident number from filename
    Example:
    INC108152642_report.pptx -> INC108152642
    """

    match = re.search(
        r"(INC\d{6,})",
        filename.upper()
    )

    if match:
        return match.group(1)

    return None


# -----------------------------------
# Converter Page
# -----------------------------------
@converter_bp.route("/converter")
def converter_page():
    return render_template("converter.html")


# -----------------------------------
# Preview
# -----------------------------------
@converter_bp.route("/converter/preview", methods=["POST"])
def preview_converter():
    try:
        file = request.files.get("ppt_file")

        if not file:
            return jsonify({
                "error": "No PPT uploaded"
            }), 400

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        ppt_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        file.save(ppt_path)

        print(f"PPT saved at: {ppt_path}")

        # -----------------------------------
        # Extract incident from PPT
        # -----------------------------------
        incident_number = extract_incident(
            ppt_path
        )

        print(
            f"Extracted from PPT: {incident_number}"
        )

        # -----------------------------------
        # Fallback if extraction fails
        # -----------------------------------
        if (
            not incident_number or
            len(incident_number) < 8
        ):
            incident_number = extract_full_incident_from_filename(
                file.filename
            )

            print(
                f"Fallback filename incident: "
                f"{incident_number}"
            )

        if not incident_number:
            return jsonify({
                "error":
                "Valid incident number not found"
            }), 400

        # -----------------------------------
        # Fetch incident details
        # -----------------------------------
        try:
            incident_data = get_incident_data(
                incident_number
            )

        except Exception as e:
            print(
                f"Incident fetch failed: {e}"
            )

            incident_data = {
                "priority": "N/A",
                "description":
                "Unable to fetch incident data"
            }

        preview_html = f"""
        <table class='preview-table'>
            <tr>
                <td><b>Incident</b></td>
                <td>{incident_number}</td>
            </tr>
            <tr>
                <td><b>Priority</b></td>
                <td>{incident_data.get('priority', 'N/A')}</td>
            </tr>
            <tr>
                <td><b>Description</b></td>
                <td>{incident_data.get('description', 'N/A')}</td>
            </tr>
        </table>
        """

        # -----------------------------------
        # Generate slide previews
        # -----------------------------------
        slide_preview_result = generate_slide_preview(
            ppt_path
        )

        print("Slide preview result:")
        print(slide_preview_result)

        slide_images = []

        if slide_preview_result["success"]:
            for img in slide_preview_result["images"]:

                filename = img["filename"]

                preview_image_store[
                    filename
                ] = img["filepath"]

                slide_images.append({
                    "filename": filename
                })

        else:
            print(
                "Slide preview failed:",
                slide_preview_result.get("error")
            )

        return jsonify({
            "preview_html": preview_html,
            "slide_images": slide_images
        })

    except Exception as e:
        print(f"Preview Error: {str(e)}")

        return jsonify({
            "error": str(e)
        }), 500


# -----------------------------------
# Serve Preview Images
# -----------------------------------
@converter_bp.route(
    "/converter/slide-preview/<filename>"
)
def serve_slide_preview(filename):

    file_path = preview_image_store.get(
        filename
    )

    if (
        file_path and
        os.path.exists(file_path)
    ):
        return send_file(file_path)

    return jsonify({
        "error": "Image not found"
    }), 404


# -----------------------------------
# Convert PPT
# -----------------------------------
@converter_bp.route(
    "/converter/convert",
    methods=["POST"]
)
def convert_ppt_route():
    try:
        ppt_file = request.files.get(
            "ppt_file"
        )

        if not ppt_file:
            return jsonify({
                "error": "No file uploaded"
            }), 400

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        upload_path = os.path.join(
            UPLOAD_FOLDER,
            ppt_file.filename
        )

        ppt_file.save(upload_path)

        print(
            f"Convert upload saved at: "
            f"{upload_path}"
        )

        slide_preview_result = generate_slide_preview(
            upload_path
        )

        print(
            "Convert slide preview result:"
        )
        print(slide_preview_result)

        slide_images = []

        if slide_preview_result["success"]:
            for img in slide_preview_result["images"]:

                filename = img["filename"]

                preview_image_store[
                    filename
                ] = img["filepath"]

                slide_images.append({
                    "filename": filename
                })

        else:
            print(
                "Slide preview generation failed:",
                slide_preview_result.get("error")
            )

        return jsonify({
            "success": True,
            "slide_images": slide_images
        })

    except Exception as e:
        print(f"Convert Error: {str(e)}")

        return jsonify({
            "error": str(e)
        }), 500


# -----------------------------------
# Generate DOC
# -----------------------------------
@converter_bp.route(
    "/converter/generate",
    methods=["POST"]
)
def generate_converter():
    try:
        file = request.files.get("ppt_file")

        if not file:
            return jsonify({
                "error": "No PPT uploaded"
            }), 400

        os.makedirs(
            UPLOAD_FOLDER,
            exist_ok=True
        )

        os.makedirs(
            OUTPUT_FOLDER,
            exist_ok=True
        )

        filename = file.filename

        ppt_path = os.path.join(
            UPLOAD_FOLDER,
            filename
        )

        # -----------------------------------
        # IMPORTANT FIX:
        # If file already exists from preview,
        # reuse it instead of overwriting
        # -----------------------------------
        if not os.path.exists(ppt_path):
            file.save(ppt_path)
            print(
                f"Saved fresh PPT: {ppt_path}"
            )
        else:
            print(
                f"Reusing existing PPT: {ppt_path}"
            )

        print(
            f"Generating DOC from: {ppt_path}"
        )

        output_file = convert_ppt(
            ppt_path,
            OUTPUT_FOLDER
        )

        print(
            f"Generated DOC: {output_file}"
        )

        return jsonify({
            "filename": os.path.basename(
                output_file
            )
        })

    except Exception as e:
        print(
            f"Generate Error: {str(e)}"
        )

        return jsonify({
            "error": str(e)
        }), 500


# -----------------------------------
# Download
# -----------------------------------
@converter_bp.route(
    "/converter/download/<filename>"
)
def download_converter(filename):
    try:
        path = os.path.join(
            OUTPUT_FOLDER,
            filename
        )

        if not os.path.exists(path):
            return jsonify({
                "error":
                "File not found"
            }), 404

        return send_file(
            path,
            as_attachment=True
        )

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500