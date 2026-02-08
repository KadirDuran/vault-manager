import api from './api';
import { Vault, VaultStatus } from '../types';

export const vaultService = {
    getAll: async (): Promise<Vault[]> => {
        const response = await api.get<Vault[]>('/vaults/');
        return response.data;
    },

    create: async (vaultData: Partial<Vault> & { token?: string }): Promise<Vault> => {
        const response = await api.post<Vault>('/vaults/', vaultData);
        return response.data;
    },

    delete: async (id: number): Promise<Vault> => {
        const response = await api.delete<Vault>(`/vaults/${id}`);
        return response.data;
    },

    checkHealth: async (id: number): Promise<VaultStatus> => {
        const response = await api.get<VaultStatus>(`/vaults/${id}/health`);
        return response.data;
    },

    unseal: async (id: number, keys: string[]): Promise<any> => {
        const response = await api.post(`/vaults/${id}/unseal`, { keys, reset: false });
        return response.data;
    },

    seal: async (id: number): Promise<any> => {
        const response = await api.post(`/vaults/${id}/seal`);
        return response.data;
    },

    autoUnseal: async (id: number): Promise<any> => {
        const response = await api.post(`/vaults/${id}/unseal?auto=true`, {});
        return response.data;
    },

    updateSettings: async (id: number, settings: { auto_unseal_enabled: boolean; auto_unseal_interval_minutes: number }): Promise<any> => {
        const response = await api.patch(`/vaults/${id}`, settings);
        return response.data;
    },

    // Secret Management
    listMounts: async (vaultId: number): Promise<any> => {
        const response = await api.get(`/secrets/${vaultId}/mounts`);
        return response.data;
    },

    listSecrets: async (vaultId: number, mountPoint: string, path: string): Promise<any> => {
        const response = await api.get(`/secrets/${vaultId}/secrets`, {
            params: { mount_point: mountPoint, path }
        });
        return response.data;
    },

    readSecret: async (vaultId: number, mountPoint: string, path: string): Promise<any> => {
        const response = await api.get(`/secrets/${vaultId}/secret`, {
            params: { mount_point: mountPoint, path }
        });
        return response.data;
    },

    writeSecret: async (vaultId: number, mountPoint: string, path: string, secret: any): Promise<any> => {
        const response = await api.post(`/secrets/${vaultId}/secret`, {
            mount_point: mountPoint,
            path,
            secret
        });
        return response.data;
    },

    deleteSecret: async (vaultId: number, mountPoint: string, path: string): Promise<any> => {
        const response = await api.delete(`/secrets/${vaultId}/secret`, {
            params: { mount_point: mountPoint, path }
        });
        return response.data;
    },

    // Policy Management
    listPolicies: async (vaultId: number): Promise<string[]> => {
        const response = await api.get<string[]>(`/policies/${vaultId}/`);
        return response.data;
    },

    readPolicy: async (vaultId: number, name: string): Promise<string> => {
        const response = await api.get<string>(`/policies/${vaultId}/${name}`);
        return response.data;
    },

    setPolicy: async (vaultId: number, name: string, rules: string): Promise<any> => {
        const response = await api.post(`/policies/${vaultId}/`, { name, rules });
        return response.data;
    },

    deletePolicy: async (vaultId: number, name: string): Promise<any> => {
        const response = await api.delete(`/policies/${vaultId}/${name}`);
        return response.data;
    },

    // Token Management
    createToken: async (vaultId: number, params: any): Promise<any> => {
        const response = await api.post(`/tokens/${vaultId}/create`, params);
        return response.data;
    },

    revokeToken: async (vaultId: number, token: string): Promise<any> => {
        const response = await api.post(`/tokens/${vaultId}/revoke`, { token });
        return response.data;
    },

    // AppRole Management
    listAppRoles: async (vaultId: number): Promise<string[]> => {
        const response = await api.get<string[]>(`/approles/${vaultId}/`);
        return response.data;
    },

    createAppRole: async (vaultId: number, role: any): Promise<any> => {
        const response = await api.post(`/approles/${vaultId}/`, role);
        return response.data;
    },

    deleteAppRole: async (vaultId: number, roleName: string): Promise<any> => {
        const response = await api.delete(`/approles/${vaultId}/${roleName}`);
        return response.data;
    },

    getRoleId: async (vaultId: number, roleName: string): Promise<string> => {
        const response = await api.get<string>(`/approles/${vaultId}/${roleName}/role-id`);
        return response.data;
    },

    createSecretId: async (vaultId: number, roleName: string): Promise<any> => {
        const response = await api.post<any>(`/approles/${vaultId}/${roleName}/secret-id`);
        return response.data;
    },

    // Monitoring
    getOverview: async (vaultId: number): Promise<any> => {
        const response = await api.get(`/monitor/${vaultId}/overview`);
        return response.data;
    }
};
