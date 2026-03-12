from datetime import datetime
from sqlalchemy.orm import Session

from app import models
from app.services.orchestration import run_scan


def rescan_active_targets(db: Session):
    targets = db.query(models.Target).filter(models.Target.is_active == True).all()
    for t in targets:
        run_scan(db, target=t, initiated_by=None, trigger_type="scheduled")


def detect_transitions(db: Session):
    # This is a placeholder for comparing previous scan summaries.
    history = db.query(models.ScanRun).order_by(models.ScanRun.created_at.desc()).limit(2).all()
    if len(history) < 2:
        return []
    latest, previous = history[0], history[1]
    transitions = []
    if latest.zombie_count > previous.zombie_count:
        transitions.append("new_zombie_detected")
    if latest.shadow_count > previous.shadow_count:
        transitions.append("new_shadow_detected")
    return transitions
