from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Vault(Base):
    __tablename__ = "vaults"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String)
    auth_method = Column(String, default="token") # token, approle
    encrypted_token = Column(String) # For token auth
    role_id = Column(String) # For approle auth
    encrypted_secret_id = Column(String) # For approle auth
    tags = Column(String) # Comma separated tags
    auto_unseal_enabled = Column(Boolean, default=False)
    auto_unseal_interval_minutes = Column(Integer, default=5) # Check interval in minutes
    last_auto_unseal_check = Column(DateTime(timezone=True), nullable=True) # Last time auto-unseal was checked
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    unseal_keys = relationship("VaultUnsealKey", back_populates="vault", cascade="all, delete-orphan")

class VaultUnsealKey(Base):
    __tablename__ = "vault_unseal_keys"

    id = Column(Integer, primary_key=True, index=True)
    vault_id = Column(Integer, ForeignKey("vaults.id"), nullable=False)
    encrypted_key = Column(String, nullable=False)
    key_index = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vault = relationship("Vault", back_populates="unseal_keys")
