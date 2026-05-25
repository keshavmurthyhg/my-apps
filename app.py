from flask import (
    Flask,
    render_template,
    send_from_directory
)

import os


# -----------------------------
# BLUEPRINT IMPORTS
# -----------------------------
from routes.report_routes import report_bp
from routes.converter_routes import converter_bp
from routes.search_routes import search_bp
from routes.bulk_routes import bulk_bp
from modules.excel_compare_v2.layout import excel_compare_bp
from routes.test_routes import common_layout_bp
from routes.excel_merge_routes import excel_merge_bp
from routes.dcn_sequence_routes import dcn_sequence_bp
from routes.dcn_analytics_routes import dcn_analytics_bp
from modules.operations_center.ops_center_tracker_api import (
    operations_center_bp
)

# -----------------------------
# APP INIT
# -----------------------------
app = Flask(__name__)
app.secret_key = "report_app_secret"


# -----------------------------
# FOLDERS
# -----------------------------
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    OUTPUT_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER


# -----------------------------
# REGISTER BLUEPRINTS
# -----------------------------
app.register_blueprint(report_bp)
app.register_blueprint(converter_bp)
app.register_blueprint(search_bp)
app.register_blueprint(bulk_bp)
app.register_blueprint(excel_compare_bp, url_prefix="")
app.register_blueprint(common_layout_bp)
app.register_blueprint(excel_merge_bp)
app.register_blueprint(dcn_sequence_bp)
app.register_blueprint(dcn_analytics_bp)
app.register_blueprint(
    operations_center_bp
)

# -----------------------------
# HOME PAGE
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# COMPARE PAGE
# -----------------------------
@app.route("/compare")
def compare_page():
    return render_template("compare.html")

@app.route("/common_layout")
def common_layout_test():
    return render_template("module.html")

# -----------------------------
# SERVE UPLOADED FILES
# -----------------------------
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(
        "uploads",
        filename
    )


# -----------------------------
# RUN APP
# -----------------------------
if __name__ == "__main__":
    app.run(
        debug=True,
        use_reloader=False
    )