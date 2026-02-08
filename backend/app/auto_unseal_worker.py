import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.vault import Vault, VaultUnsealKey
from app.services.vault_service import vault_service
from app.services.encryption_service import encryption_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def auto_unseal_worker():
    """
    Background worker that periodically checks vaults and unseals those with stored keys.
    """
    logger.info("Auto-unseal worker started")
    
    while True:
        try:
            db = SessionLocal()
            try:
                # Query vaults with auto_unseal_enabled=True
                vaults = db.query(Vault).filter(Vault.auto_unseal_enabled == True).all()
                
                for vault in vaults:
                    try:
                        # Check if check is due
                        if not vault.last_auto_unseal_check:
                            is_due = True
                        else:
                            now = datetime.now(timezone.utc)
                            diff = now - vault.last_auto_unseal_check
                            interval_seconds = (vault.auto_unseal_interval_minutes or 5) * 60
                            is_due = diff.total_seconds() >= interval_seconds
                        
                        if is_due:
                            logger.info(f"Checking vault {vault.id} ({vault.name}) for auto-unseal...")
                            
                            # Check seal status
                            status = vault_service.get_seal_status(vault)
                            
                            if status.get("sealed"):
                                logger.info(f"Vault {vault.name} is sealed. Attempting auto-unseal...")
                                
                                # Fetch stored unseal keys
                                unseal_key_objs = db.query(VaultUnsealKey).filter(
                                    VaultUnsealKey.vault_id == vault.id
                                ).order_by(VaultUnsealKey.key_index).all()
                                
                                if unseal_key_objs:
                                    # Decrypt keys
                                    keys = [encryption_service.decrypt(key_obj.encrypted_key) for key_obj in unseal_key_objs]
                                    
                                    # Perform unseal
                                    vault_service.unseal_vault(vault, keys)
                                    logger.info(f"Vault {vault.name} auto-unsealed successfully.")
                                else:
                                    logger.warning(f"No unseal keys stored for vault {vault.name}.")
                            else:
                                logger.info(f"Vault {vault.name} is already unsealed.")
                            
                            # Update last check time
                            vault.last_auto_unseal_check = datetime.now(timezone.utc)
                            db.commit()
                            
                    except Exception as ve:
                        logger.error(f"Error checking vault {vault.id}: {ve}")
                        
            finally:
                db.close()
                        
        except Exception as e:
            logger.error(f"Auto-unseal worker loop error: {e}")
            
        # Sleep for a bit before next check cycle (e.g., 10 seconds)
        await asyncio.sleep(10)

def start_auto_unseal_worker():
    """
    Starts the auto-unseal worker in the background.
    """
    asyncio.create_task(auto_unseal_worker())
