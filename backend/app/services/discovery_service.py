from typing import List, Dict, Tuple
from app.services.discovery import fetch_openapi_endpoints, crawl_endpoints, load_log_traffic


def discover_endpoints(base_url: str, log_file: str | None) -> Tuple[List[Dict], Dict[str, int]]:
    openapi_eps = fetch_openapi_endpoints(base_url)
    crawler_eps = crawl_endpoints(base_url)
    traffic = load_log_traffic(log_file)
    endpoints = openapi_eps + crawler_eps
    return endpoints, traffic
