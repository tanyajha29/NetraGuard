from typing import Dict, List, Tuple
from collections import defaultdict


def aggregate_traffic(traffic_map: Dict[str, int]) -> List[Tuple[str, int]]:
    """
    Returns list of (path, count) sorted desc.
    """
    return sorted(traffic_map.items(), key=lambda x: x[1], reverse=True)


def record_samples(db, api_assets, traffic_map, models):
    for asset in api_assets:
        count = traffic_map.get(asset.path, 0)
        if count:
            sample = models.TrafficSample(
                api_asset_id=asset.id,
                path=asset.path,
                method=asset.method,
                count=count,
            )
            db.add(sample)
