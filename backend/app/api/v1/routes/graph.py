from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dependency_mapper import graph_payload

router = APIRouter()


@router.get("/dependencies")
def dependencies(db: Session = Depends(get_db)):
    return graph_payload(db)
