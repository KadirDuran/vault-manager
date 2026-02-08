import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography
} from '@mui/material';
import { vaultService } from '../../services/vaultService';

interface VaultSettingsDialogProps {
    open: boolean;
    onClose: () => void;
    vaultId: number | null;
    vaultName: string;
    currentSettings?: {
        auto_unseal_enabled: boolean;
        auto_unseal_interval_minutes: number;
    };
    onSave: () => void;
}

const VaultSettingsDialog: React.FC<VaultSettingsDialogProps> = ({
    open,
    onClose,
    vaultId,
    vaultName,
    currentSettings,
    onSave
}) => {
    const [autoUnsealEnabled, setAutoUnsealEnabled] = useState(false);
    const [intervalMinutes, setIntervalMinutes] = useState(5);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (currentSettings) {
            setAutoUnsealEnabled(currentSettings.auto_unseal_enabled);
            setIntervalMinutes(currentSettings.auto_unseal_interval_minutes);
        }
    }, [currentSettings]);

    const handleSave = async () => {
        if (!vaultId) return;

        setSaving(true);
        try {
            await vaultService.updateSettings(vaultId, {
                auto_unseal_enabled: autoUnsealEnabled,
                auto_unseal_interval_minutes: intervalMinutes
            });
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to update vault settings:', error);
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Vault Settings: {vaultName}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Auto-Unseal Configuration
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoUnsealEnabled}
                                onChange={(e) => setAutoUnsealEnabled(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Enable Auto-Unseal"
                    />

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Automatically unseal this vault when it becomes sealed
                    </Typography>

                    {autoUnsealEnabled && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Check Interval</InputLabel>
                            <Select
                                value={intervalMinutes}
                                label="Check Interval"
                                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                            >
                                <MenuItem value={1}>Every 1 minute</MenuItem>
                                <MenuItem value={5}>Every 5 minutes</MenuItem>
                                <MenuItem value={10}>Every 10 minutes</MenuItem>
                                <MenuItem value={15}>Every 15 minutes</MenuItem>
                                <MenuItem value={30}>Every 30 minutes</MenuItem>
                                <MenuItem value={60}>Every 60 minutes</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VaultSettingsDialog;
