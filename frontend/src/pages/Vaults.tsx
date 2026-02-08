import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VaultList from '../components/vault/VaultList';
import VaultForm from '../components/vault/VaultForm';
import UnsealDialog from '../components/vault/UnsealDialog';
import VaultSettingsDialog from '../components/vault/VaultSettingsDialog';
import { vaultService } from '../services/vaultService';
import { Vault } from '../types';

const Vaults: React.FC = () => {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [vaultStatuses, setVaultStatuses] = useState<{ [key: number]: any }>({});
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);

    // Unseal state
    const [openUnseal, setOpenUnseal] = useState(false);
    const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    // Settings state
    const [openSettings, setOpenSettings] = useState(false);
    const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

    const fetchVaults = async () => {
        try {
            setLoading(true);
            const data = await vaultService.getAll();
            setVaults(data);

            // Fetch status for each vault
            const statuses: { [key: number]: any } = {};
            await Promise.all(data.map(async (v) => {
                try {
                    const status = await vaultService.checkHealth(v.id);
                    statuses[v.id] = status;
                } catch (e) {
                    statuses[v.id] = { error: true };
                }
            }));
            setVaultStatuses(statuses);

        } catch (error) {
            console.error("Failed to fetch vaults", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaults();

        // Auto refresh status every 10 seconds
        const interval = setInterval(() => {
            fetchVaults();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleCreate = async (vault: any) => {
        try {
            await vaultService.create(vault);
            fetchVaults();
            setOpenForm(false);
        } catch (error) {
            console.error("Failed to create vault", error);
            throw error;
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await vaultService.delete(id);
            fetchVaults();
        } catch (error) {
            console.error("Failed to delete vault", error);
        }
    }

    const handleUnsealClick = async (id: number) => {
        try {
            await vaultService.autoUnseal(id);
            setSnackbar({ open: true, message: 'Vault unsealed successfully!', severity: 'success' });
            const status = await vaultService.checkHealth(id);
            setVaultStatuses(prev => ({ ...prev, [id]: status }));
        } catch (error: any) {
            setSnackbar({ open: true, message: error.response?.data?.detail || 'Failed to unseal vault', severity: 'error' });
        }
    }

    const handleSealClick = async (id: number) => {
        if (window.confirm("Are you sure you want to seal this vault?")) {
            try {
                await vaultService.seal(id);
                // Refresh status immediately
                const status = await vaultService.checkHealth(id);
                setVaultStatuses(prev => ({ ...prev, [id]: status }));
            } catch (error) {
                console.error("Failed to seal vault", error);
                alert("Failed to seal vault");
            }
        }
    }

    const handleSettingsClick = (vault: Vault) => {
        setSelectedVault(vault);
        setOpenSettings(true);
    };

    const handleSettingsSave = () => {
        fetchVaults(); // Refresh vaults to get updated settings
    };

    const handleUnsealSubmit = async (keys: string[]) => {
        if (!selectedVaultId) return;
        try {
            await vaultService.unseal(selectedVaultId, keys);
            // Refresh status immediately
            const status = await vaultService.checkHealth(selectedVaultId);
            setVaultStatuses(prev => ({ ...prev, [selectedVaultId]: status }));
        } catch (error) {
            console.error("Failed to unseal vault", error);
            throw error;
        }
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Vaults
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenForm(true)}
                >
                    Add Vault
                </Button>
            </Box>

            {loading && vaults.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <VaultList
                    vaults={vaults}
                    onDelete={handleDelete}
                    onUnseal={handleUnsealClick}
                    onSeal={handleSealClick}
                    onSettings={handleSettingsClick}
                    vaultStatuses={vaultStatuses}
                />
            )}

            <VaultForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleCreate}
            />

            <UnsealDialog
                open={openUnseal}
                onClose={() => setOpenUnseal(false)}
                onUnseal={handleUnsealSubmit}
            />

            <VaultSettingsDialog
                open={openSettings}
                onClose={() => setOpenSettings(false)}
                vaultId={selectedVault?.id || null}
                vaultName={selectedVault?.name || ''}
                currentSettings={{
                    auto_unseal_enabled: selectedVault?.auto_unseal_enabled || false,
                    auto_unseal_interval_minutes: selectedVault?.auto_unseal_interval_minutes || 5
                }}
                onSave={handleSettingsSave}
            />
        </Container>
    );
};

export default Vaults;
