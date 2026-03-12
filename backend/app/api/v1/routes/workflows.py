from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas import workflow as workflow_schema

router = APIRouter()


@router.post("", response_model=workflow_schema.WorkflowOut)
def create_workflow(
    body: workflow_schema.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workflow = models.DecommissionWorkflow(
        api_asset_id=body.api_asset_id,
        scan_run_id=body.scan_run_id,
        workflow_status=models.WorkflowStatus(body.workflow_status),
        mode=models.WorkflowMode(body.mode),
        notes=body.notes,
        action_taken=body.action_taken,
        initiated_by=current_user.id if current_user else None,
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.get("", response_model=list[workflow_schema.WorkflowOut])
def list_workflows(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.DecommissionWorkflow)
        .order_by(models.DecommissionWorkflow.created_at.desc())
        .all()
    )


@router.patch("/{workflow_id}", response_model=workflow_schema.WorkflowOut)
def update_workflow(
    workflow_id: int,
    body: workflow_schema.WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    wf = (
        db.query(models.DecommissionWorkflow)
        .filter(models.DecommissionWorkflow.id == workflow_id)
        .first()
    )
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.workflow_status = models.WorkflowStatus(body.workflow_status)
    wf.mode = models.WorkflowMode(body.mode)
    wf.notes = body.notes
    wf.action_taken = body.action_taken
    db.commit()
    db.refresh(wf)
    return wf
