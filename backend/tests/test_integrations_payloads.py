import types
from app.integrations import slack_service, jira_service, github_service


def test_slack_alert_block_format():
    blocks = slack_service.alert_block("Test", {"Endpoint": "/api/v1/test", "Severity": "high"})
    assert isinstance(blocks, list)
    assert any("section" in b.get("type", "") for b in blocks)


def test_jira_enabled_flag_without_env(monkeypatch):
    monkeypatch.setenv("JIRA_API_TOKEN", "")
    monkeypatch.setenv("JIRA_EMAIL", "")
    monkeypatch.setenv("JIRA_BASE_URL", "")
    monkeypatch.setenv("JIRA_PROJECT_KEY", "")
    assert jira_service.enabled() is False


def test_github_extract_paths_from_source():
    sample = 'router.get("/api/v1/users")\napp.post("/api/v1/login")'
    paths = github_service._extract_paths_from_source(sample)
    assert "/api/v1/users" in paths
    assert "/api/v1/login" in paths
