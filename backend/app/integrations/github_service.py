"""
Lightweight GitHub integration for repository-based API discovery.
Fetches OpenAPI specs and scans source files for route patterns.
"""
from __future__ import annotations
import base64
import json
import re
from typing import List, Dict, Optional
import requests

from app.core.config import get_settings

settings = get_settings()

GITHUB_API = "https://api.github.com"


def _headers() -> Dict[str, str]:
    if not settings.github_token:
        return {}
    return {"Authorization": f"Bearer {settings.github_token}", "Accept": "application/vnd.github+json"}


def _repos() -> List[str]:
    if not settings.github_repos:
        return []
    return [r.strip() for r in settings.github_repos.split(",") if r.strip()]


def _fetch_file(owner: str, repo: str, path: str, branch: str) -> Optional[str]:
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    params = {"ref": branch}
    resp = requests.get(url, headers=_headers(), params=params, timeout=10)
    if resp.status_code != 200:
        return None
    data = resp.json()
    if data.get("encoding") == "base64":
        return base64.b64decode(data.get("content", "")).decode("utf-8", errors="ignore")
    if data.get("content"):
        try:
            return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
        except Exception:
            return None
    return None


def _extract_from_openapi(text: str) -> List[Dict]:
    try:
        doc = json.loads(text)
    except Exception:
        return []
    endpoints = []
    for path, methods in doc.get("paths", {}).items():
        for method, details in methods.items():
            if method.upper() not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
                continue
            endpoints.append(
                {
                    "path": path,
                    "method": method.upper(),
                    "summary": details.get("summary", ""),
                    "source_type": "github_openapi",
                    "requires_auth": bool(details.get("security")),
                }
            )
    return endpoints


ROUTE_REGEX = re.compile(r'["\\\'](/api[^"\\\']*)["\\\']')


def _extract_paths_from_source(text: str) -> List[str]:
    return list(set(ROUTE_REGEX.findall(text)))


def discover_from_repo(repo: str) -> List[Dict]:
    owner = settings.github_owner
    branch = settings.github_branch or "main"
    if not owner:
        return []
    discovered: List[Dict] = []

    openapi_candidates = ["openapi.json", "openapi.yaml", "swagger.json", "swagger.yaml"]
    for cand in openapi_candidates:
        content = _fetch_file(owner, repo, cand, branch)
        if content:
            discovered += [
                {**ep, "source_repo": repo, "source_path": cand, "source_branch": branch, "discovered_from": "github"}
                for ep in _extract_from_openapi(content)
            ]

    # simple scan of common directories
    code_paths = [
        "routes.py",
        "routers.py",
        "app.py",
        "main.py",
        "src/routes",
        "src/controllers",
        "src/api",
    ]
    for path in code_paths:
        content = _fetch_file(owner, repo, path, branch)
        if not content:
            continue
        for p in _extract_paths_from_source(content):
            discovered.append(
                {
                    "path": p,
                    "method": "GET",
                    "source_type": "github_code",
                    "source_repo": repo,
                    "source_path": path,
                    "source_branch": branch,
                    "discovered_from": "github",
                }
            )

    return discovered


def discover_endpoints_from_github() -> List[Dict]:
    eps: List[Dict] = []
    for repo in _repos():
        try:
            eps.extend(discover_from_repo(repo))
        except Exception as exc:
            # log and continue
            print(f"[github] discovery failed for {repo}: {exc}")
            continue
    return eps
