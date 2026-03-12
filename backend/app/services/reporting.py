import os
from datetime import datetime
from typing import Dict, List

from jinja2 import Template

from app.core.config import get_settings
from app.models import ScanRun, APIAsset, APIFinding

settings = get_settings()

REPORT_TEMPLATE = Template(
    """
    <html>
    <head><title>NetraGuard Scan Report {{ scan.id }}</title></head>
    <body>
        <h1>NetraGuard Scan Report</h1>
        <h3>Scan #{{ scan.id }} · Target {{ scan.target_id }}</h3>
        <p>Started: {{ scan.started_at }} · Ended: {{ scan.ended_at }}</p>
        <h2>Executive Summary</h2>
        <p>Total APIs: {{ scan.total_apis }} · Active {{ scan.active_count }} · Deprecated {{ scan.deprecated_count }} · Shadow {{ scan.shadow_count }} · Zombie {{ scan.zombie_count }}</p>

        <h2>Inventory Summary</h2>
        <ul>
        {% for a in assets %}
            <li>{{ a.method }} {{ a.path }} — {{ a.current_status }} (risk {{ a.risk_level }})</li>
        {% endfor %}
        </ul>

        <h2>Findings</h2>
        <ul>
        {% for f in findings %}
            <li>[{{ f.severity }}] {{ f.title }} — {{ f.description }}</li>
        {% endfor %}
        </ul>

        <h2>Recommendations</h2>
        <p>Review zombie/shadow APIs and run decommission workflow. Ensure rate limiting and authentication are enforced. Schedule continuous monitoring via Celery beat.</p>
    </body>
    </html>
    """
)


def render_report(scan: ScanRun, assets: List[APIAsset], findings: List[APIFinding]) -> str:
    output_dir = os.path.join("backend", "reports")
    os.makedirs(output_dir, exist_ok=True)
    filename = f"scan_{scan.id}.html"
    file_path = os.path.join(output_dir, filename)
    html = REPORT_TEMPLATE.render(scan=scan, assets=assets, findings=findings)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html)
    return file_path
