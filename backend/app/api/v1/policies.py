from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.vault_service import vault_service

router = APIRouter()

@router.get("/{vault_id}/", response_model=List[str])
def list_policies(
    vault_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List policies.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
        
    try:
        return vault_service.list_policies(vault)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{vault_id}/{name}", response_model=str)
def read_policy(
    vault_id: int,
    name: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Read policy rules.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.read_policy(vault, name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{vault_id}/", response_model=dict)
def set_policy(
    vault_id: int,
    policy_in: schemas.PolicyCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create or update policy.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        vault_service.set_policy(vault, policy_in.name, policy_in.rules)
        return {"message": "Policy set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{vault_id}/{name}", response_model=dict)
def delete_policy(
    vault_id: int,
    name: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete policy.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        vault_service.delete_policy(vault, name)
        return {"message": "Policy deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
