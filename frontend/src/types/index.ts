export interface User {
    id: number;
    email: string;
    username: string;
    role: string;
    is_active: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface Vault {
    id: number;
    name: string;
    url: string;
    description?: string;
    auth_method: string;
    tags?: string;
    created_at: string;
    auto_unseal_enabled?: boolean;
    auto_unseal_interval_minutes?: number;
    last_auto_unseal_check?: string;
}

export interface VaultStatus {
    sealed: boolean;
    t: number;
    n: number;
    progress: number;
    version: string;
}
