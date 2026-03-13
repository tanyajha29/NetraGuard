from typing import Dict

SENSITIVE_KEYS = [
    "password",
    "token",
    "secret",
    "pan",
    "aadhaar",
    "ssn",
    "account_number",
    "card_number",
]


def analyze_api(endpoint: Dict, base_url: str) -> Dict:
    """
    Lightweight static security checks using endpoint metadata.
    """
    path = endpoint["path"]
    lower_path = path.lower()
    risky_path = any(k in lower_path for k in ["internal", "debug", "admin", "test"])
    https = base_url.startswith("https://")
    sensitive = any(k in lower_path for k in SENSITIVE_KEYS)

    has_auth = endpoint.get("requires_auth", False)
    rate_limit = endpoint.get("rate_limit_detected", False)

    findings = []
    if not has_auth:
        findings.append(("missing_auth", "high", "Authentication missing", "Protect with JWT/api keys"))
    if not https:
        findings.append(("insecure_transport", "high", "HTTPS not enforced", "Terminate TLS at gateway"))
    if risky_path:
        findings.append(("internal_debug_exposed", "medium", "Internal/debug path exposed", "Restrict to internal networks"))
    if not rate_limit:
        findings.append(("no_rate_limit_detected", "medium", "No rate limiting detected", "Add rate limits"))
    if sensitive:
        findings.append(("sensitive_data_exposed", "high", "Sensitive data indicator in path", "Mask or remove sensitive fields"))

    return {
        "findings": findings,
        "auth_required": has_auth,
        "encryption_enabled": https,
        "rate_limit_detected": rate_limit,
        "risky_path": risky_path,
        "sensitive": sensitive,
    }
