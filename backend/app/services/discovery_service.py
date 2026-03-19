from typing import List, Dict, Tuple
from app.services.discovery import fetch_openapi_endpoints, crawl_endpoints, load_log_traffic
from app.integrations.github_service import discover_endpoints_from_github


def discover_endpoints(base_url: str, log_file: str | None) -> Tuple[List[Dict], Dict[str, int]]:
    openapi_eps = fetch_openapi_endpoints(base_url)
    crawler_eps = crawl_endpoints(base_url)
    traffic = load_log_traffic(log_file)
    github_eps = discover_endpoints_from_github()
    endpoints = openapi_eps + crawler_eps + github_eps
    return endpoints, traffic
