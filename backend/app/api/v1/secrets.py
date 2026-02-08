from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.vault_service import vault_service

router = APIRouter()

@router.get("/{vault_id}/mounts", response_model=Any)
def list_mounts(
    vault_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List secret engines (mounts).
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
        
    try:
        return vault_service.list_mounts(vault)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{vault_id}/secrets", response_model=Any)
def list_secrets(
    vault_id: int,
    mount_point: str,
    path: str = "",
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List secrets at path.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.list_secrets(vault, mount_point, path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{vault_id}/secret", response_model=Any)
def read_secret(
    vault_id: int,
    mount_point: str,
    path: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Read secret value.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.read_secret(vault, mount_point, path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{vault_id}/secret", response_model=Any)
def write_secret(
    vault_id: int,
    secret_in: schemas.SecretWriteRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Write secret value.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.write_secret(vault, secret_in.mount_point, secret_in.path, secret_in.secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{vault_id}/secret", response_model=Any)
def delete_secret(
    vault_id: int,
    mount_point: str,
    path: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete secret.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        vault_service.delete_secret(vault, mount_point, path)
        return {"message": "Secret deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
