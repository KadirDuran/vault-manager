from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.vault_service import vault_service

router = APIRouter()

@router.get("/{vault_id}/", response_model=List[str])
def list_approles(
    vault_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List AppRoles.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
        
    try:
        return vault_service.list_approles(vault)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{vault_id}/", response_model=Any)
def create_approle(
    vault_id: int,
    role: schemas.AppRoleCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create or update AppRole.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        # Check params and filter
        params = role.dict(exclude={'role_name'}, exclude_none=True)
        vault_service.create_or_update_approle(vault, role.role_name, params)
        return {"message": "AppRole created/updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{vault_id}/{role_name}", response_model=Any)
def delete_approle(
    vault_id: int,
    role_name: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete AppRole.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        vault_service.delete_approle(vault, role_name)
        return {"message": "AppRole deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{vault_id}/{role_name}/role-id", response_model=str)
def get_role_id(
    vault_id: int,
    role_name: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get RoleID for AppRole.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.get_role_id(vault, role_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{vault_id}/{role_name}/secret-id", response_model=Any)
def create_secret_id(
    vault_id: int,
    role_name: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate new SecretID for AppRole.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == vault_id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    try:
        return vault_service.create_secret_id(vault, role_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
