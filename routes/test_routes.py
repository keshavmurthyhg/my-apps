from flask import Blueprint, render_template

common_layout_bp = Blueprint(
    "common_layout",
    __name__
)

@common_layout_bp.route("/common-layout")
def common_layout_test():
    return render_template("module.html")