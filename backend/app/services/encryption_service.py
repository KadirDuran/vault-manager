from cryptography.fernet import Fernet
from app.core.config import settings
import base64

class EncryptionService:
    def __init__(self):
        # Ensure key is bytes
        key = settings.ENCRYPTION_KEY
        if isinstance(key, str):
            key = key.encode()
        self.fernet = Fernet(key)

    def encrypt(self, data: str) -> str:
        if not data:
            return None
        return self.fernet.encrypt(data.encode()).decode()

    def decrypt(self, data: str) -> str:
        if not data:
            return None
        return self.fernet.decrypt(data.encode()).decode()

encryption_service = EncryptionService()
