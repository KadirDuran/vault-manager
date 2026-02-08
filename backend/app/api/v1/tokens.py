from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.vault_service import vault_service

router = APIRouter()

@router.post("/{vault_id}/create", response_model=Any)
def create_token(
    vault_id: int,
    token_in: schemas.TokenIssueRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Issue a new token.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
        
    try:
        # Filter None values
        params = {k: v for k, v in token_in.dict().items() if v is not None}
        return vault_service.create_token(vault, params)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{vault_id}/revoke", response_model=Any)
def revoke_token(
    vault_id: int,
    revoke_in: schemas.TokenRevokeRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Revoke a token.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        vault_service.revoke_token(vault, revoke_in.token)
        return {"message": "Token revoked"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
