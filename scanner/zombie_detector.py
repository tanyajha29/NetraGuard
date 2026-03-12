def classify_endpoint(endpoint: str, traffic: int) -> dict:
    """Classify an endpoint and compute risk score."""
    ep_lower = endpoint.lower()

    # Status classification
    if any(kw in ep_lower for kw in ["internal", "debug", "health-raw"]):
        status = "shadow"
    elif traffic == 0 and any(kw in ep_lower for kw in ["old", "test", "dev", "mock", "legacy"]):
        status = "zombie"
    elif traffic == 0:
        status = "zombie"
    elif traffic < 20:
        status = "deprecated"
    else:
        status = "active"

    # Risk scoring
    inactivity_score = 40 if traffic == 0 else (20 if traffic < 20 else 0)
    exposure_score = 30 if any(kw in ep_lower for kw in ["internal", "debug"]) else 10
    lifecycle_score = 30 if status == "zombie" else (20 if status == "deprecated" else 5)

    risk_score = inactivity_score + exposure_score + lifecycle_score

    # Risk level
    if risk_score >= 70:
        risk_level = "Critical"
    elif risk_score >= 50:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Recommendation
    recommendations = {
        "zombie": "🔴 Decommission immediately — no traffic detected",
        "shadow": "🟠 Restrict access — undocumented internal API exposed",
        "deprecated": "🟡 Plan sunset — low traffic, schedule removal",
        "active": "🟢 Monitor — API is healthy and active",
    }

    return {
        "status": status,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendation": recommendations[status],
    }
