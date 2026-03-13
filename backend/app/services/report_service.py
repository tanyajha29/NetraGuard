import os
from typing import List
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML
from app.core.config import get_settings
from app import models

settings = get_settings()

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape()
)


def render_report(scan: models.ScanRun, assets: List[models.APIAsset], findings: List[models.APIFinding]) -> str:
    os.makedirs(settings.reports_dir, exist_ok=True)
    template = env.get_template("report.html")
    html_content = template.render(scan=scan, assets=assets, findings=findings, settings=settings)
    file_path = os.path.join(settings.reports_dir, f"scan_{scan.id}.pdf")
    HTML(string=html_content).write_pdf(file_path)
    return file_path
