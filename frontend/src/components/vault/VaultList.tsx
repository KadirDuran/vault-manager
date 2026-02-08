import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import CountdownTimer from './CountdownTimer';
import { Vault } from '../../types';

interface VaultListProps {
    vaults: Vault[];
    onDelete: (id: number) => void;
    onEdit?: (vault: Vault) => void;
    onUnseal: (id: number) => void;
    onSeal: (id: number) => void;
    onSettings?: (vault: Vault) => void;
    vaultStatuses: { [key: number]: any };
}

const VaultList: React.FC<VaultListProps> = ({ vaults, onDelete, onEdit, onUnseal, onSeal, onSettings, vaultStatuses }) => {
    // Force refresh: 2026-02-08 01:50
    console.log("VaultList component rendered");
    if (vaults.length === 0) {
        return (
            <Typography variant="body1" align="center" color="textSecondary">
                No vaults found. Add one to get started.
            </Typography>
        );
    }

    return (
        <Grid container spacing={3}>
            {vaults.map((vault) => {
                const status = vaultStatuses[vault.id];
                const isSealed = status?.sealed;

                return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vault.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" component="div" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.location.href = `/vaults/${vault.id}/dashboard`}>
                                        {vault.name}
                                    </Typography>
                                    {status ? (
                                        <Chip
                                            label={isSealed ? "Sealed" : "Unsealed"}
                                            color={isSealed ? "error" : "success"}
                                            size="small"
                                            icon={isSealed ? <LockIcon /> : <LockOpenIcon />}
                                        />
                                    ) : (
                                        <Chip label="Checking..." size="small" />
                                    )}
                                    {status && !status.error && (
                                        <Typography variant="caption" color="text.secondary">
                                            Version: {status.version}
                                        </Typography>
                                    )}
                                </Box>
                                {isSealed && status && !status.error && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        Progress: {status.progress} / {status.t}
                                    </Typography>
                                )}
                                {console.log(`Vault ${vault.id} (${vault.name}) auto_unseal:`, {
                                    enabled: vault.auto_unseal_enabled,
                                    enabledType: typeof vault.auto_unseal_enabled,
                                    interval: vault.auto_unseal_interval_minutes,
                                    lastCheck: vault.last_auto_unseal_check
                                })}
                                {Boolean(vault.auto_unseal_enabled) && (
                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={`Auto-unseal: ${vault.auto_unseal_interval_minutes}min`}
                                            color="info"
                                            size="small"
                                        />
                                        <CountdownTimer
                                            lastCheckTime={vault.last_auto_unseal_check}
                                            intervalMinutes={vault.auto_unseal_interval_minutes || 5}
                                            enabled={!!vault.auto_unseal_enabled}
                                        />
                                    </Box>
                                )}

                                <Box sx={{ mt: 2 }}>
                                    {vault.tags && vault.tags.split(',').map(tag => (
                                        <Chip key={tag} label={tag.trim()} size="small" sx={{ mr: 0.5 }} />
                                    ))}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {status?.sealed && (
                                    <Button size="small" variant="contained" color="warning" onClick={() => onUnseal(vault.id)}>
                                        Unseal
                                    </Button>
                                )}
                                {!status?.sealed && status && !status.error && (
                                    <>
                                        <Button size="small" variant="outlined" color="primary" onClick={() => window.location.href = `/vaults/${vault.id}/secrets`}>
                                            Secrets
                                        </Button>
                                        <Button size="small" variant="outlined" color="secondary" onClick={() => window.location.href = `/vaults/${vault.id}/policies`}>
                                            Policies
                                        </Button>
                                        <Button size="small" variant="outlined" color="info" onClick={() => window.location.href = `/vaults/${vault.id}/tokens`}>
                                            Tokens
                                        </Button>
                                        <Button size="small" variant="outlined" color="success" onClick={() => window.location.href = `/vaults/${vault.id}/approles`}>
                                            AppRoles
                                        </Button>
                                        <Button size="small" variant="outlined" color="error" onClick={() => onSeal(vault.id)}>
                                            Seal
                                        </Button>
                                    </>
                                )}

                                <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit && onEdit(vault)}>
                                    Edit
                                </Button>
                                <Button size="small" startIcon={<SettingsIcon />} onClick={() => onSettings && onSettings(vault)}>
                                    Settings
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => onDelete(vault.id)}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default VaultList;
