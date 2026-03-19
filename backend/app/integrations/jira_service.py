"""
Jira integration for remediation task creation.
"""
from __future__ import annotations
from typing import Optional, Dict, Any
import requests

from app.core.config import get_settings

settings = get_settings()


def enabled() -> bool:
    return bool(settings.jira_api_token and settings.jira_email and settings.jira_base_url and settings.jira_project_key)


def _headers() -> Dict[str, str]:
    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def create_issue(summary: str, description: str, issue_type: str = "Task") -> Optional[Dict[str, str]]:
    if not enabled():
        return None
    url = f"{settings.jira_base_url}/rest/api/3/issue"
    auth = (settings.jira_email, settings.jira_api_token)
    payload = {
        "fields": {
            "project": {"key": settings.jira_project_key},
            "summary": summary,
            "description": description,
            "issuetype": {"name": issue_type},
        }
    }
    try:
        resp = requests.post(url, headers=_headers(), json=payload, auth=auth, timeout=8)
        if resp.status_code not in (200, 201):
            print(f"[jira] create failed: {resp.status_code} {resp.text}")
            return None
        data = resp.json()
        key = data.get("key")
        url = f"{settings.jira_base_url}/browse/{key}" if key else None
        return {"key": key, "url": url}
    except Exception as exc:
        print(f"[jira] exception: {exc}")
        return None
