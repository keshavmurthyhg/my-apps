import os
from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    send_file
)

from modules.converter.converter import convert_ppt
from modules.converter.incident_extractor import extract_incident
from modules.rca.fetch_incident import get_incident_data

converter_bp = Blueprint(
    "converter",
    __name__
)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"


@converter_bp.route("/converter")
def converter_page():
    return render_template("converter.html")


@converter_bp.route("/converter/preview", methods=["POST"])
def preview_converter():
    try:
        file = request.files.get("ppt_file")

        if not file:
            return jsonify({
                "error": "No PPT uploaded"
            }), 400

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        ppt_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        file.save(ppt_path)

        print(f"PPT saved at: {ppt_path}")

        # Extract incident number
        incident_number = extract_incident(ppt_path)

        print(f"Extracted incident: {incident_number}")

        if not incident_number:
            return jsonify({
                "error": "Incident number not found in PPT"
            }), 400

        # Fetch incident details
        try:
            incident_data = get_incident_data(
                incident_number
            )
        except Exception as e:
            print(f"Incident fetch failed: {e}")

            incident_data = {
                "priority": "N/A",
                "description": "Unable to fetch incident data"
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

        return jsonify({
            "preview_html": preview_html
        })

    except Exception as e:
        print(f"Preview Error: {str(e)}")

        return jsonify({
            "error": str(e)
        }), 500


@converter_bp.route(
    "/converter/generate",
    methods=["POST"]
)
def generate_converter():

    file = request.files["ppt_file"]

    ppt_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    file.save(ppt_path)

    output_file = convert_ppt(
        ppt_path,
        OUTPUT_FOLDER
    )

    return jsonify({
        "filename": os.path.basename(output_file)
    })


@converter_bp.route(
    "/converter/download/<filename>"
)
def download_converter(filename):

    path = os.path.join(
        OUTPUT_FOLDER,
        filename
    )

    return send_file(
        path,
        as_attachment=True
    )