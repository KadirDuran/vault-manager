from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.api import deps
from app.services.vault_service import vault_service

router = APIRouter()

@router.get("/{vault_id}/overview", response_model=Any)
def get_vault_overview(
    vault_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Vault Overview Data.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.get_vault_overview(vault)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
