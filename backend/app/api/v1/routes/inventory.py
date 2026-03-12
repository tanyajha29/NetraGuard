from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas import inventory as inventory_schema

router = APIRouter()


@router.get("", response_model=list[inventory_schema.APIAssetOut])
def list_inventory(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    target_id: int | None = None,
):
    query = db.query(models.APIAsset)
    if target_id:
        query = query.filter(models.APIAsset.target_id == target_id)
    return query.all()


@router.get("/{asset_id}", response_model=inventory_schema.APIAssetOut)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    asset = db.query(models.APIAsset).filter(models.APIAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset
