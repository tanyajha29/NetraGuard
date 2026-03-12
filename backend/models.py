from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

Base = declarative_base()

class APIEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String, unique=True, index=True)
    method = Column(String, default="GET")
    traffic_count = Column(Integer, default=0)
    status = Column(String, default="unknown")
    risk_level = Column(String, default="unknown")
    risk_score = Column(Float, default=0.0)
    last_seen = Column(DateTime, default=datetime.utcnow)
    first_discovered = Column(DateTime, default=datetime.utcnow)
    recommendation = Column(String, default="")
    scan_id = Column(String, default="")


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    target_url = Column(String)
    log_file = Column(String)
    total_apis = Column(Integer, default=0)
    active_count = Column(Integer, default=0)
    zombie_count = Column(Integer, default=0)
    shadow_count = Column(Integer, default=0)
    deprecated_count = Column(Integer, default=0)
    new_apis_detected = Column(Integer, default=0)
    status = Column(String, default="completed")
