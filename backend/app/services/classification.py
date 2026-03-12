from app.core.config import get_settings

settings = get_settings()


def classify_endpoint(path: str, traffic: int) -> dict:
    ep_lower = path.lower()
    shadow_words = [w.strip() for w in settings.shadow_keywords.split(",") if w]
    zombie_words = [w.strip() for w in settings.zombie_keywords.split(",") if w]

    # Status
    if any(kw in ep_lower for kw in shadow_words):
        status = "shadow"
    elif traffic <= settings.zombie_traffic_max and any(kw in ep_lower for kw in zombie_words):
        status = "zombie"
    elif traffic <= settings.zombie_traffic_max:
        status = "zombie"
    elif traffic <= settings.deprecated_traffic_max:
        status = "deprecated"
    elif traffic >= settings.active_traffic_min:
        status = "active"
    else:
        status = "active"

    # Scores
    inactivity_score = 40 if traffic <= settings.zombie_traffic_max else (20 if traffic < settings.active_traffic_min else 0)
    exposure_score = 30 if any(kw in ep_lower for kw in shadow_words) else 10
    lifecycle_score = 30 if status == "zombie" else (20 if status == "deprecated" else 5)
    risk_score = inactivity_score + exposure_score + lifecycle_score

    if risk_score >= 70:
        risk_level = "Critical"
    elif risk_score >= 50:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    recommendations = {
        "zombie": "Decommission immediately – no traffic detected",
        "shadow": "Restrict access – undocumented internal API exposed",
        "deprecated": "Plan sunset – low traffic, schedule removal",
        "active": "Monitor – API is healthy",
    }

    return {
        "status": status,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendation": recommendations.get(status, ""),
    }
