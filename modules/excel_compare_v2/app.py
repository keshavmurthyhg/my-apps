from flask import Flask, render_template
from modules.excel_compare_v2.layout import excel_compare_bp

app = Flask(__name__)
app.register_blueprint(excel_compare_bp)

if __name__ == "__main__":
    app.run(debug=True)