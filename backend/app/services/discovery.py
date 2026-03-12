import json
import os
from typing import List, Dict

import requests

from app.core.config import get_settings

settings = get_settings()


def fetch_openapi_endpoints(base_url: str) -> List[Dict]:
    try:
        resp = requests.get(f"{base_url}/openapi.json", timeout=5)
        resp.raise_for_status()
        spec = resp.json()
    except Exception as exc:
        print(f"[discovery] Failed to fetch OpenAPI: {exc}")
        return []

    endpoints = []
    for path, methods in spec.get("paths", {}).items():
        for method, details in methods.items():
            if method.upper() not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
                continue
            endpoints.append(
                {
                    "path": path,
                    "method": method.upper(),
                    "summary": details.get("summary", ""),
                    "tags": details.get("tags", []),
                    "source_type": "openapi",
                    "source_reference": f"{base_url}/openapi.json",
                }
            )
    return endpoints


def load_log_traffic(log_file: str | None) -> Dict[str, int]:
    if not log_file:
        return {}
    log_path = os.path.join(settings.logs_dir, log_file)
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        print(f"[discovery] Failed to read log file {log_file}: {exc}")
        return {}
