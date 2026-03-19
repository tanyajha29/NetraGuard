from typing import List, Dict
from sqlalchemy.orm import Session
from app import models


def upsert_edges(db: Session, source_assets: List[models.APIAsset], traffic_map: Dict[str, int]):
    """
    Naive heuristic: connect APIs that share a leading path segment, skipping self-loops
    and duplicate edges.
    """
    existing = {(e.source_api_id, e.target_api_id) for e in db.query(models.DependencyEdge).all()}
    assets = list(source_assets)
    for src in assets:
        src_prefix = src.path.rsplit("/", 1)[0]
        for tgt in assets:
            if src.id == tgt.id:
                continue
            tgt_prefix = tgt.path.rsplit("/", 1)[0]
            related = tgt.path.startswith(src_prefix) or src.path.startswith(tgt_prefix)
            if related and (src.id, tgt.id) not in existing:
                db.add(models.DependencyEdge(source_api_id=src.id, target_api_id=tgt.id))
                existing.add((src.id, tgt.id))


def graph_payload(db: Session):
    nodes = []
    edges = []
    assets = db.query(models.APIAsset).all()
    for a in assets:
        nodes.append(
            {
                "id": a.id,
                "label": f"{a.method} {a.path}",
                "risk": a.risk_level,
                "status": a.current_status,
                "traffic": a.traffic_count,
            }
        )
    for e in db.query(models.DependencyEdge).all():
        edges.append({"source": e.source_api_id, "target": e.target_api_id})
    return {"nodes": nodes, "edges": edges}
