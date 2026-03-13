import json
import os
from typing import List, Dict

import requests

from app.core.config import get_settings

settings = get_settings()

ALLOWED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}


def _normalize_path(path: str) -> str:
    if not path.startswith("/"):
        return f"/{path}"
    return path


def _detect_requires_auth(operation: dict, spec: dict) -> bool:
    """
    Basic auth detection: check operation-level or global security schemes.
    """
    op_security = operation.get("security", [])
    global_security = spec.get("security", [])
    return bool(op_security or global_security)


def fetch_openapi_endpoints(base_url: str) -> List[Dict]:
    """
    Pulls /openapi.json and normalizes operations into a simple endpoint list.
    """
    try:
        resp = requests.get(f"{base_url}/openapi.json", timeout=5)
        resp.raise_for_status()
        spec = resp.json()
    except Exception as exc:
        print(f"[discovery] Failed to fetch OpenAPI: {exc}")
        return []

    endpoints = []
    for path, methods in spec.get("paths", {}).items():
        norm_path = _normalize_path(path)
        for method, details in methods.items():
            method_upper = method.upper()
            if method_upper not in ALLOWED_METHODS:
                continue
            endpoints.append(
                {
                    "path": norm_path,
                    "method": method_upper,
                    "summary": details.get("summary", ""),
                    "tags": details.get("tags", []),
                    "source_type": "openapi",
                    "source_reference": f"{base_url}/openapi.json",
                    "requires_auth": _detect_requires_auth(details, spec),
                    "version": "v2" if "v2" in norm_path else "v1",
                }
            )
    return endpoints


def crawl_endpoints(base_url: str) -> List[Dict]:
    """
    Lightweight crawler that probes a curated list of high-signal paths
    (health, internal debug, common REST resources).
    """
    if not settings.crawl_enabled:
        return []

    discovered = []
    paths = [p.strip() for p in settings.crawl_common_paths.split(",") if p.strip()]
    for path in paths:
        norm_path = _normalize_path(path)
        url = f"{base_url}{norm_path}"
        try:
            resp = requests.get(url, timeout=settings.crawl_timeout_seconds)
            if resp.status_code < 500:
                discovered.append(
                    {
                        "path": norm_path,
                        "method": "GET",
                        "source_type": "crawler",
                        "source_reference": url,
                        "requires_auth": resp.status_code == 401,
                        "version": "v2" if "v2" in norm_path else "v1",
                    }
                )
        except Exception as exc:
            print(f"[discovery] crawler failed for {url}: {exc}")
            continue
    return discovered


def load_log_traffic(log_file: str | None) -> Dict[str, int]:
    """
    Loads a traffic counter JSON file where keys are paths and values are counts.
    """
    if not log_file:
        return {}
    log_path = os.path.join(settings.logs_dir, log_file)
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        print(f"[discovery] Failed to read log file {log_file}: {exc}")
        return {}
