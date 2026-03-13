from typing import Dict, List
from app.services.security_analysis import analyze_api


def analyze_endpoint(endpoint: Dict, base_url: str) -> Dict:
    return analyze_api(endpoint, base_url)


def summarize_findings(findings: List[Dict]) -> Dict[str, int]:
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = (f.get("severity") or "low").lower()
        if sev in counts:
            counts[sev] += 1
    return counts
