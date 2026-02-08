import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { vaultService } from '../../services/vaultService';

interface SecretDetailProps {
    vaultId: number;
    mountPoint: string | null;
    path: string | null;
    onDelete?: () => void;
}

const SecretDetail: React.FC<SecretDetailProps> = ({ vaultId, mountPoint, path, onDelete }) => {
    const [data, setData] = useState<string>('');
    const [version, setVersion] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (mountPoint && path) {
            loadSecret();
        } else {
            setData('');
            setVersion(null);
        }
    }, [vaultId, mountPoint, path]);

    const loadSecret = async () => {
        if (!mountPoint || !path) return;
        setLoading(true);
        setError('');
        try {
            const result = await vaultService.readSecret(vaultId, mountPoint, path);
            // Determine format. Usually data.data.data for v2
            const secretData = result.data.data;
            setVersion(result.data.metadata.version);
            setData(JSON.stringify(secretData, null, 2));
        } catch (err) {
            console.error(err);
            setError("Failed to load secret. It might not exist or you don't have permission.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!mountPoint || !path) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const parsedData = JSON.parse(data);
            await vaultService.writeSecret(vaultId, mountPoint, path, parsedData);
            setSuccess('Secret saved successfully.');
            loadSecret(); // Refresh version
        } catch (err) {
            setError('Failed to save secret. Ensure valid JSON.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!mountPoint || !path) return;
        if (!window.confirm("Are you sure you want to delete this secret?")) return;

        try {
            await vaultService.deleteSecret(vaultId, mountPoint, path);
            if (onDelete) onDelete();
            setData('');
            setVersion(null);
        } catch (err) {
            setError('Failed to delete secret.');
        }
    };

    if (!mountPoint || !path) {
        return (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">Select a secret to view details</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography variant="h6">{path}</Typography>
                    <Typography variant="caption" color="textSecondary">{mountPoint}</Typography>
                    {version && <Typography variant="caption" display="block">Version: {version}</Typography>}
                </Box>
                <Box>
                    <IconButton onClick={handleDelete} color="error" title="Delete Secret">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TextField
                    label="Secret Data (JSON)"
                    multiline
                    fullWidth
                    rows={15}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    sx={{ mb: 2, fontFamily: 'monospace' }}
                    InputProps={{
                        style: { fontFamily: 'monospace' }
                    }}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || saving}
                >
                    {saving ? 'Saving...' : 'Save Version'}
                </Button>
            </Box>
        </Paper>
    );
};

export default SecretDetail;
