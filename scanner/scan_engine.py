import sys, os, uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from database.db import SessionLocal, init_db
from backend.models import APIEndpoint, ScanHistory
from scanner.api_discovery import discover_apis
from scanner.log_analyzer import analyze_logs
from scanner.zombie_detector import classify_endpoint

def run_scan(target_url: str, log_file: str) -> dict:
    init_db()
    db = SessionLocal()
    scan_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow()

    try:
        # 1. Discover endpoints
        discovered = discover_apis(target_url)
        if not discovered:
            return {"error": "Could not reach API server", "scan_id": scan_id}

        # 2. Load traffic logs
        traffic = analyze_logs(log_file)

        # 3. Get previously known endpoints
        existing = {e.endpoint: e for e in db.query(APIEndpoint).all()}
        new_count = 0

        processed = []
        for ep in discovered:
            path = ep["endpoint"]
            count = traffic.get(path, 0)
            classification = classify_endpoint(path, count)

            is_new = path not in existing

            if is_new:
                new_count += 1
                record = APIEndpoint(
                    endpoint=path,
                    method=ep["method"],
                    traffic_count=count,
                    status=classification["status"],
                    risk_level=classification["risk_level"],
                    risk_score=classification["risk_score"],
                    last_seen=now,
                    first_discovered=now,
                    recommendation=classification["recommendation"],
                    scan_id=scan_id,
                )
                db.add(record)
            else:
                rec = existing[path]
                rec.traffic_count = count
                rec.status = classification["status"]
                rec.risk_level = classification["risk_level"]
                rec.risk_score = classification["risk_score"]
                rec.last_seen = now
                rec.recommendation = classification["recommendation"]
                rec.scan_id = scan_id

            processed.append({
                "endpoint": path,
                "method": ep["method"],
                "traffic_count": count,
                "is_new": is_new,
                **classification,
            })

        db.commit()

        # 4. Summarize
        statuses = [p["status"] for p in processed]
        summary = {
            "scan_id": scan_id,
            "timestamp": now.isoformat(),
            "target_url": target_url,
            "log_file": log_file,
            "total_apis": len(processed),
            "active_count": statuses.count("active"),
            "zombie_count": statuses.count("zombie"),
            "shadow_count": statuses.count("shadow"),
            "deprecated_count": statuses.count("deprecated"),
            "new_apis_detected": new_count,
            "endpoints": processed,
        }

        # 5. Save scan history
        hist = ScanHistory(
            scan_id=scan_id,
            timestamp=now,
            target_url=target_url,
            log_file=log_file,
            total_apis=summary["total_apis"],
            active_count=summary["active_count"],
            zombie_count=summary["zombie_count"],
            shadow_count=summary["shadow_count"],
            deprecated_count=summary["deprecated_count"],
            new_apis_detected=new_count,
            status="completed",
        )
        db.add(hist)
        db.commit()

        print(f"[ScanEngine] Scan {scan_id} complete. {len(processed)} APIs processed.")
        return summary

    except Exception as e:
        db.rollback()
        return {"error": str(e), "scan_id": scan_id}
    finally:
        db.close()


def get_all_endpoints():
    init_db()
    db = SessionLocal()
    try:
        rows = db.query(APIEndpoint).all()
        return [
            {
                "endpoint": r.endpoint,
                "method": r.method,
                "traffic_count": r.traffic_count,
                "status": r.status,
                "risk_level": r.risk_level,
                "risk_score": r.risk_score,
                "last_seen": r.last_seen.isoformat() if r.last_seen else "",
                "recommendation": r.recommendation,
            }
            for r in rows
        ]
    finally:
        db.close()


def get_scan_history():
    init_db()
    db = SessionLocal()
    try:
        rows = db.query(ScanHistory).order_by(ScanHistory.timestamp.desc()).limit(10).all()
        return [
            {
                "scan_id": r.scan_id,
                "timestamp": r.timestamp.isoformat() if r.timestamp else "",
                "log_file": r.log_file,
                "total_apis": r.total_apis,
                "zombie_count": r.zombie_count,
                "active_count": r.active_count,
                "shadow_count": r.shadow_count,
                "new_apis_detected": r.new_apis_detected,
            }
            for r in rows
        ]
    finally:
        db.close()
