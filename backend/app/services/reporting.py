import os
from typing import List

from jinja2 import Template

from app.core.config import get_settings
from app.models import ScanRun, APIAsset, APIFinding

settings = get_settings()

REPORT_TEMPLATE = Template(
    """
    <html>
    <head>
        <title>NetraGuard Scan Report {{ scan.id }}</title>
        <style>
            body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; }
            h1, h2, h3 { color: #0f172a; margin-bottom: 8px; }
            .section { margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; }
            .pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
            .pill-critical { background:#fee2e2; color:#991b1b; }
            .pill-high { background:#fef3c7; color:#92400e; }
            .pill-medium { background:#e0f2fe; color:#075985; }
            .pill-low { background:#ecfdf3; color:#166534; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
            th { background: #f8fafc; }
        </style>
    </head>
    <body>
        <h1>NetraGuard Scan Report</h1>
        <div class="section">
            <h3>Scan Metadata</h3>
            <div class="grid">
                <div class="card"><strong>Scan ID:</strong> {{ scan.id }}</div>
                <div class="card"><strong>Target:</strong> {{ scan.target_id }}</div>
                <div class="card"><strong>Started:</strong> {{ scan.started_at }}</div>
                <div class="card"><strong>Ended:</strong> {{ scan.ended_at }}</div>
                <div class="card"><strong>Trigger:</strong> {{ scan.trigger_type }}</div>
            </div>
        </div>

        <div class="section">
            <h2>Executive Summary</h2>
            <div class="grid">
                <div class="card">Total APIs: <strong>{{ scan.total_apis }}</strong></div>
                <div class="card">Active: <strong>{{ scan.active_count }}</strong></div>
                <div class="card">Deprecated: <strong>{{ scan.deprecated_count }}</strong></div>
                <div class="card">Shadow: <strong>{{ scan.shadow_count }}</strong></div>
                <div class="card">Zombie: <strong>{{ scan.zombie_count }}</strong></div>
                <div class="card">Orphaned: <strong>{{ scan.orphaned_count }}</strong></div>
            </div>
        </div>

        <div class="section">
            <h2>Inventory Summary</h2>
            <table>
                <thead>
                    <tr><th>Method</th><th>Path</th><th>Status</th><th>Risk</th><th>Traffic</th></tr>
                </thead>
                <tbody>
                {% for a in assets %}
                    <tr>
                        <td>{{ a.method }}</td>
                        <td>{{ a.path }}</td>
                        <td>{{ a.current_status }}</td>
                        <td>{{ a.risk_level }}</td>
                        <td>{{ a.traffic_count }}</td>
                    </tr>
                {% endfor %}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Security Posture Summary</h2>
            <ul>
                <li>Authentication present on {{ assets|selectattr("auth_required")|list|length }} / {{ assets|length }} APIs</li>
                <li>HTTPS enforced: {{ assets|selectattr("encryption_enabled")|list|length }} / {{ assets|length }}</li>
                <li>Rate limiting detected: {{ assets|selectattr("rate_limit_detected")|list|length }} / {{ assets|length }}</li>
            </ul>
        </div>

        <div class="section">
            <h2>Zombie APIs</h2>
            <ul>
            {% for a in assets if a.current_status == "zombie" %}
                <li>{{ a.method }} {{ a.path }} — traffic {{ a.traffic_count }}</li>
            {% endfor %}
            </ul>
        </div>

        <div class="section">
            <h2>Findings</h2>
            <ul>
            {% for f in findings %}
                <li>
                    <span class="pill pill-{{ f.severity if f.severity!='critical' else 'critical' }}">{{ f.severity }}</span>
                    {{ f.title }} — {{ f.description }}
                </li>
            {% endfor %}
            </ul>
        </div>

        <div class="section">
            <h2>Recommendations</h2>
            <p>Prioritize zombie/shadow APIs for decommission. Enforce authentication and rate limiting, review internal/debug routes, and schedule continuous monitoring via Celery beat.</p>
        </div>

        <div class="section">
            <h2>Workflow / Decommission</h2>
            <p>Zombie APIs trigger automatic workflows (demo auto-disable for mock targets). Real targets stay in pending_review until approved.</p>
        </div>
    </body>
    </html>
    """
)


def render_report(scan: ScanRun, assets: List[APIAsset], findings: List[APIFinding]) -> str:
    output_dir = settings.reports_dir
    os.makedirs(output_dir, exist_ok=True)
    filename = f"scan_{scan.id}.html"
    file_path = os.path.join(output_dir, filename)
    html = REPORT_TEMPLATE.render(scan=scan, assets=assets, findings=findings)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(html)
    return file_path
