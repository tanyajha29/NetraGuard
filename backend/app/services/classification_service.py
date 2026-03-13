from typing import Dict
from app.services.classification import classify_endpoint as core_classify


def classify(path: str, traffic: int, source_type: str, documented: bool, has_owner: bool, version: str | None) -> Dict:
    return core_classify(path, traffic, source_type=source_type, documented=documented, has_owner=has_owner, version=version)
