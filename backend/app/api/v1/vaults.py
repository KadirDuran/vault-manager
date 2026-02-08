from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app import models, schemas
from app.schemas.unseal import UnsealRequest
from app.api import deps
from app.services.encryption_service import encryption_service
from app.services.vault_service import vault_service

router = APIRouter()

@router.get("/", response_model=List[schemas.Vault])
def read_vaults(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve vaults.
    """
    vaults = db.query(models.Vault).offset(skip).limit(limit).all()
    return vaults

@router.post("/", response_model=schemas.Vault)
def create_vault(
    *,
    db: Session = Depends(deps.get_db),
    vault_in: schemas.VaultCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new vault.
    """
    encrypted_token = None
    if vault_in.token:
        encrypted_token = encryption_service.encrypt(vault_in.token)
        
    vault = models.Vault(
        name=vault_in.name,
        url=vault_in.url,
        description=vault_in.description,
        auth_method=vault_in.auth_method,
        encrypted_token=encrypted_token,
        tags=vault_in.tags,
    )
    db.add(vault)
    db.commit()
    db.refresh(vault)
    
    # Store unseal keys if provided
    unseal_keys = [vault_in.unseal_key_1, vault_in.unseal_key_2, vault_in.unseal_key_3]
    for idx, key in enumerate(unseal_keys, start=1):
        if key:
            encrypted_key = encryption_service.encrypt(key)
            unseal_key_obj = models.VaultUnsealKey(
                vault_id=vault.id,
                encrypted_key=encrypted_key,
                key_index=idx
            )
            db.add(unseal_key_obj)
    
    db.commit()
    return vault

@router.get("/{id}/health", response_model=dict)
def check_vault_health(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Check vault health/seal status.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
        
    status = vault_service.get_seal_status(vault)
    return status

@router.post("/{id}/unseal", response_model=dict)
def unseal_vault(
    id: int,
    auto: bool = Query(False),
    unseal_in: schemas.UnsealRequest = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Unseal a vault. If auto=true, uses stored unseal keys.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
    
    try:
        if auto:
            # Fetch stored unseal keys
            unseal_key_objs = db.query(models.VaultUnsealKey).filter(
                models.VaultUnsealKey.vault_id == id
            ).order_by(models.VaultUnsealKey.key_index).all()
            
            if not unseal_key_objs:
                raise HTTPException(status_code=400, detail="No unseal keys stored for this vault")
            
            # Decrypt keys
            keys = [encryption_service.decrypt(key_obj.encrypted_key) for key_obj in unseal_key_objs]
            result = vault_service.unseal_vault(vault, keys)
            
            # Update last check time
            from datetime import datetime, timezone
            vault.last_auto_unseal_check = datetime.now(timezone.utc)
            db.commit()
        else:
            # Use provided keys
            if not unseal_in or not unseal_in.keys:
                raise HTTPException(status_code=400, detail="Unseal keys required")
            result = vault_service.unseal_vault(vault, unseal_in.keys, unseal_in.reset)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/seal", response_model=dict)
def seal_vault(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Seal a vault (Admin only).
    """
    vault = db.query(models.Vault).filter(models.Vault.id == id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
        
    try:
        vault_service.seal_vault(vault)
        return {"message": "Vault sealed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", response_model=schemas.Vault)
def delete_vault(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a vault.
    """
    vault = db.query(models.Vault).filter(models.Vault.id == id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
    db.delete(vault)
    db.commit()
    return vault
@router.patch("/{id}", response_model=schemas.Vault)
def update_vault_settings(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    vault_in: schemas.VaultUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update vault settings (auto-unseal, etc).
    """
    vault = db.query(models.Vault).filter(models.Vault.id == id).first()
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
    
    update_data = vault_in.dict(exclude_unset=True)
    
    # Handle token encryption if provided
    if "token" in update_data and update_data["token"]:
        update_data["encrypted_token"] = encryption_service.encrypt(update_data.pop("token"))
    
    # Initialize/Refresh last_auto_unseal_check when auto-unseal is enabled
    if update_data.get("auto_unseal_enabled"):
        from datetime import datetime, timezone
        update_data["last_auto_unseal_check"] = datetime.now(timezone.utc)
    
    # Update vault attributes
    for field, value in update_data.items():
        if hasattr(vault, field):
            setattr(vault, field, value)
    
    db.commit()
    db.refresh(vault)
    return vault
