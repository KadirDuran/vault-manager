import hvac
from sqlalchemy.orm import Session
from app.models.vault import Vault
from app.services.encryption_service import encryption_service

class VaultService:
    def get_client(self, vault: Vault) -> hvac.Client:
        """
        Creates an HVAC client for the given vault.
        """
        client = hvac.Client(url=vault.url)
        
        # If token auth
        if vault.auth_method == "token" and vault.encrypted_token:
            token = encryption_service.decrypt(vault.encrypted_token)
            client.token = token
            
        # If approle auth implementation needed, add here
        
        return client

    def check_connection(self, vault: Vault) -> bool:
        """
        Checks if the vault is reachable and sealed status.
        Returns True if reachable.
        """
        try:
            client = self.get_client(vault)
            return client.is_sealed() is not None # Just checking reachability
        except Exception as e:
            print(f"Connection failed: {e}")
            return False

    def get_seal_status(self, vault: Vault) -> dict:
        try:
            client = self.get_client(vault)
            return client.sys.read_seal_status()
        except Exception:
            return {"sealed": True, "error": "Connection failed", "version": "unknown"}

    def unseal_vault(self, vault: Vault, keys: list[str]) -> dict:
        """
        Unseals the vault with provided keys.
        """
        try:
            client = self.get_client(vault)
            # Submit keys one by one
            result = None
            for key in keys:
                result = client.sys.submit_unseal_key(key)
            return result
        except Exception as e:
            raise Exception(f"Failed to unseal vault: {str(e)}")

    def seal_vault(self, vault: Vault) -> None:
        """
        Seals the vault.
        """
        try:
            client = self.get_client(vault)
            client.sys.seal()
        except Exception as e:
            raise Exception(f"Failed to seal vault: {str(e)}")

    def list_mounts(self, vault: Vault) -> dict:
        """
        List enabled secret engines.
        """
        try:
            client = self.get_client(vault)
            return client.sys.list_mounted_secrets_engines()
        except Exception as e:
            raise Exception(f"Failed to list mounts: {str(e)}")

    def list_secrets(self, vault: Vault, mount_point: str, path: str) -> dict:
        """
        List secrets at a specific path.
        """
        try:
            client = self.get_client(vault)
            # HVAC list method handles the trailing slash requirement usually
            return client.secrets.kv.v2.list_secrets(
                path=path,
                mount_point=mount_point
            )
        except Exception as e:
             # handle v1 or other errors if needed, for now start with v2
            raise Exception(f"Failed to list secrets: {str(e)}")

    def read_secret(self, vault: Vault, mount_point: str, path: str) -> dict:
        """
        Read a secret.
        """
        try:
            client = self.get_client(vault)
            return client.secrets.kv.v2.read_secret_version(
                path=path,
                mount_point=mount_point
            )
        except Exception as e:
            raise Exception(f"Failed to read secret: {str(e)}")

    def write_secret(self, vault: Vault, mount_point: str, path: str, secret: dict) -> dict:
        """
        Write or update a secret.
        """
        try:
            client = self.get_client(vault)
            return client.secrets.kv.v2.create_or_update_secret(
                path=path,
                secret=secret,
                mount_point=mount_point
            )
        except Exception as e:
            raise Exception(f"Failed to write secret: {str(e)}")

    def delete_secret(self, vault: Vault, mount_point: str, path: str) -> None:
        """
        Delete a secret (all versions or latest).
        """
        try:
            client = self.get_client(vault)
            client.secrets.kv.v2.delete_metadata_and_all_versions(
                path=path,
                mount_point=mount_point
            )
        except Exception as e:
            raise Exception(f"Failed to delete secret: {str(e)}")

    # Policy Management
    def list_policies(self, vault: Vault) -> list[str]:
        try:
            client = self.get_client(vault)
            return client.sys.list_policies()['data']['policies']
        except Exception as e:
             raise Exception(f"Failed to list policies: {str(e)}")

    def read_policy(self, vault: Vault, name: str) -> str:
        try:
            client = self.get_client(vault)
            return client.sys.read_policy(name)['data']['rules']
        except Exception as e:
             raise Exception(f"Failed to read policy: {str(e)}")

    def set_policy(self, vault: Vault, name: str, rules: str) -> None:
        try:
            client = self.get_client(vault)
            client.sys.create_or_update_policy(name, rules)
        except Exception as e:
             raise Exception(f"Failed to set policy: {str(e)}")

    def delete_policy(self, vault: Vault, name: str) -> None:
        try:
            client = self.get_client(vault)
            client.sys.delete_policy(name)
        except Exception as e:
             raise Exception(f"Failed to delete policy: {str(e)}")

    # Token Management
    def create_token(self, vault: Vault, params: dict) -> dict:
        try:
            client = self.get_client(vault)
            return client.auth.token.create(**params)
        except Exception as e:
             raise Exception(f"Failed to create token: {str(e)}")

    def revoke_token(self, vault: Vault, token_to_revoke: str) -> None:
        try:
            client = self.get_client(vault)
            client.auth.token.revoke(token=token_to_revoke)
        except Exception as e:
             raise Exception(f"Failed to revoke token: {str(e)}")

    # AppRole Management
    def list_approles(self, vault: Vault) -> list[str]:
        try:
            client = self.get_client(vault)
            # List roles usually returns {'keys': ['role1', 'role2']}
            return client.auth.approle.list_roles()['data']['keys']
        except Exception as e:
             # If no roles exist or approle not enabled, this might fail.
             # Ideally check if secret engine enabled, but simple try-catch for now.
             raise Exception(f"Failed to list approles: {str(e)}")

    def get_role_id(self, vault: Vault, role_name: str) -> str:
        try:
            client = self.get_client(vault)
            return client.auth.approle.read_role_id(role_name)['data']['role_id']
        except Exception as e:
             raise Exception(f"Failed to get role_id: {str(e)}")

    def create_secret_id(self, vault: Vault, role_name: str) -> dict:
        try:
            client = self.get_client(vault)
            return client.auth.approle.generate_secret_id(role_name)['data']
        except Exception as e:
             raise Exception(f"Failed to create secret_id: {str(e)}")

    def create_or_update_approle(self, vault: Vault, role_name: str, params: dict) -> None:
        try:
            client = self.get_client(vault)
            client.auth.approle.create_or_update_approle(role_name, **params)
        except Exception as e:
             raise Exception(f"Failed to create/update approle: {str(e)}")

    def delete_approle(self, vault: Vault, role_name: str) -> None:
        try:
            client = self.get_client(vault)
            client.auth.approle.delete_role(role_name)
        except Exception as e:
             raise Exception(f"Failed to delete approle: {str(e)}")

    # Monitoring
    def get_vault_overview(self, vault: Vault) -> dict:
        try:
            client = self.get_client(vault)
            
            # 1. Health
            health = client.sys.read_health_status(method='GET')
            # health is usually a dict if standby/active, or int code. HVAC returns dict usually.

            # 2. Seal Status
            seal_status = client.sys.read_seal_status()
            
            # 3. Mounts (Secrets Engines)
            mounts = client.sys.list_mounted_secrets_engines()['data']
            
            # 4. Auth Methods
            auth_methods = client.sys.list_auth_methods()['data']
            
            # 5. Policies
            policies = client.sys.list_policies()['data']['policies']

            return {
                "health": health,
                "seal_status": seal_status,
                "mounts": mounts,
                "auth_methods": auth_methods,
                "policies": policies,
                "cluster_name": getattr(health, 'cluster_name', 'unknown') if isinstance(health, dict) else 'unknown',
                "version": seal_status.get('version', 'unknown')
            }
        except Exception as e:
             raise Exception(f"Failed to get vault overview: {str(e)}")

vault_service = VaultService()
