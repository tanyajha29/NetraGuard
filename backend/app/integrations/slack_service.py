"""
Slack integration for alerting.
Failures are logged but do not break pipelines.
"""
from __future__ import annotations
import json
import requests
from typing import Dict, Any

from app.core.config import get_settings

settings = get_settings()

SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage"


def enabled() -> bool:
    return bool(settings.slack_bot_token and settings.slack_channel_id)


def send_message(blocks: list[Dict[str, Any]], text: str = "") -> bool:
    if not enabled():
        return False
    payload = {
        "channel": settings.slack_channel_id,
        "text": text or "NetraGuard alert",
        "blocks": blocks,
    }
    try:
        resp = requests.post(
            SLACK_POST_MESSAGE_URL,
            headers={"Authorization": f"Bearer {settings.slack_bot_token}", "Content-Type": "application/json; charset=utf-8"},
            data=json.dumps(payload),
            timeout=5,
        )
        ok = resp.status_code == 200 and resp.json().get("ok")
        if not ok:
            print(f"[slack] send failed: {resp.text}")
        return ok
    except Exception as exc:
        print(f"[slack] exception: {exc}")
        return False


def alert_block(title: str, lines: Dict[str, Any]) -> list[Dict[str, Any]]:
    fields = [{"type": "mrkdwn", "text": f"*{k}:* {v}"} for k, v in lines.items()]
    return [
        {"type": "section", "text": {"type": "mrkdwn", "text": f"*{title}*"}},
        {"type": "section", "fields": fields},
        {"type": "divider"},
    ]
