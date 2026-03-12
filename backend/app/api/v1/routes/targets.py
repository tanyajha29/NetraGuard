from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas import target as target_schema

router = APIRouter()


@router.post("", response_model=target_schema.TargetOut)
def create_target(
    target_in: target_schema.TargetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target = models.Target(
        **target_in.dict(),
        created_by=current_user.id,
    )
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


@router.get("", response_model=list[target_schema.TargetOut])
def list_targets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Target).all()


@router.get("/{target_id}", response_model=target_schema.TargetOut)
def get_target(
    target_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target = db.query(models.Target).filter(models.Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target
