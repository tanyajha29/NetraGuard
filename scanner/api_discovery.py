import requests
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def discover_apis(base_url: str) -> list[dict]:
    """Fetch OpenAPI spec and extract all endpoints."""
    try:
        resp = requests.get(f"{base_url}/openapi.json", timeout=5)
        resp.raise_for_status()
        spec = resp.json()
    except Exception as e:
        print(f"[Discovery] Failed to fetch OpenAPI spec: {e}")
        return []

    endpoints = []
    paths = spec.get("paths", {})
    for path, methods in paths.items():
        for method, details in methods.items():
            if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                endpoints.append({
                    "endpoint": path,
                    "method": method.upper(),
                    "summary": details.get("summary", ""),
                    "tags": details.get("tags", []),
                })
    print(f"[Discovery] Found {len(endpoints)} endpoints from {base_url}")
    return endpoints
