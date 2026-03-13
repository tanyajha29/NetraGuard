from typing import List, Dict
from sqlalchemy.orm import Session
from app import models


def upsert_edges(db: Session, source_assets: List[models.APIAsset], traffic_map: Dict[str, int]):
    # naive heuristic: create edges between assets sharing prefix segments
    path_to_asset = {a.path: a for a in source_assets}
    for path, count in traffic_map.items():
        for other_path, asset in path_to_asset.items():
            if path != other_path and path.startswith(other_path.rsplit("/", 1)[0]):
                edge = models.DependencyEdge(source_api_id=asset.id, target_api_id=asset.id)
                db.add(edge)


def graph_payload(db: Session):
    nodes = []
    edges = []
    assets = db.query(models.APIAsset).all()
    for a in assets:
        nodes.append({"id": a.id, "label": f"{a.method} {a.path}", "risk": a.risk_level})
    for e in db.query(models.DependencyEdge).all():
        edges.append({"source": e.source_api_id, "target": e.target_api_id})
    return {"nodes": nodes, "edges": edges}
