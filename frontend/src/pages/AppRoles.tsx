import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    TextField,
    Box,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useParams } from 'react-router-dom';
import { vaultService } from '../services/vaultService';

const AppRoles: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const vaultId = id ? parseInt(id) : 0;

    const [roles, setRoles] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    // Form State
    const [roleName, setRoleName] = useState('');
    const [tokenPolicies, setTokenPolicies] = useState('');
    const [tokenTtl, setTokenTtl] = useState('');
    const [tokenMaxTtl, setTokenMaxTtl] = useState('');
    const [secretIdTtl, setSecretIdTtl] = useState('');
    const [secretIdNumUses, setSecretIdNumUses] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Dialog States
    const [roleIdDialog, setRoleIdDialog] = useState(false);
    const [fetchedRoleId, setFetchedRoleId] = useState('');

    const [secretIdDialog, setSecretIdDialog] = useState(false);
    const [generatedSecretId, setGeneratedSecretId] = useState<any>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (vaultId) loadRoles();
    }, [vaultId]);

    const loadRoles = async () => {
        try {
            const list = await vaultService.listAppRoles(vaultId);
            setRoles(list || []);
        } catch (err) {
            console.error(err);
            setError("Failed to list AppRoles");
        }
    };

    const handleSelectRole = (name: string) => {
        setSelectedRole(name);
        setIsCreating(false);
        setRoleName(name);
        // Reset form or load details if we had a read endpoint (we don't have read_role in service yet, so just reset)
        setTokenPolicies('');
        setTokenTtl('');
        setTokenMaxTtl('');
        setSecretIdTtl('');
        setSecretIdNumUses('');
        setError('');
        setSuccess('');
    };

    const handleCreateNew = () => {
        setSelectedRole(null);
        setIsCreating(true);
        setRoleName('');
        setTokenPolicies('');
        setTokenTtl('');
        setTokenMaxTtl('');
        setSecretIdTtl('');
        setSecretIdNumUses('');
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        if (!roleName) return;

        const params: any = {
            role_name: roleName,
            token_policies: tokenPolicies ? tokenPolicies.split(',').map(p => p.trim()) : undefined,
            token_ttl: tokenTtl || undefined,
            token_max_ttl: tokenMaxTtl || undefined,
            secret_id_ttl: secretIdTtl || undefined,
            secret_id_num_uses: secretIdNumUses ? parseInt(secretIdNumUses) : undefined,
        };

        try {
            await vaultService.createAppRole(vaultId, params);
            setSuccess(`AppRole ${roleName} saved successfully.`);
            loadRoles();
            if (isCreating) {
                setIsCreating(false);
                setSelectedRole(roleName);
            }
        } catch (err) {
            setError("Failed to save AppRole");
        }
    };

    const handleDelete = async (name: string) => {
        if (!window.confirm(`Delete AppRole ${name}?`)) return;
        try {
            await vaultService.deleteAppRole(vaultId, name);
            if (selectedRole === name) {
                setSelectedRole(null);
                setIsCreating(false);
            }
            loadRoles();
        } catch (err) {
            setError("Failed to delete AppRole");
        }
    };

    const handleShowRoleId = async () => {
        if (!selectedRole) return;
        try {
            const rid = await vaultService.getRoleId(vaultId, selectedRole);
            setFetchedRoleId(rid);
            setRoleIdDialog(true);
        } catch (err) {
            setError("Failed to get RoleID");
        }
    };

    const handleGenerateSecretId = async () => {
        if (!selectedRole) return;
        try {
            const sid = await vaultService.createSecretId(vaultId, selectedRole);
            setGeneratedSecretId(sid);
            setSecretIdDialog(true);
        } catch (err) {
            setError("Failed to generate SecretID");
        }
    };

    if (!vaultId) return <Typography>Invalid Vault ID</Typography>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '80vh' }}>
            <Typography variant="h5" gutterBottom>AppRole Management</Typography>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ height: '100%', overflow: 'auto' }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Roles</Typography>
                            <Button startIcon={<AddIcon />} size="small" onClick={handleCreateNew}>New</Button>
                        </Box>
                        <List>
                            {roles.map(role => (
                                <ListItem
                                    key={role}
                                    disablePadding
                                >
                                    <ListItemButton
                                        selected={selectedRole === role}
                                        onClick={() => handleSelectRole(role)}
                                    >
                                        <ListItemText primary={role} />
                                    </ListItemButton>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" size="small" onClick={() => handleDelete(role)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {(selectedRole || isCreating) ? (
                            <>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {isCreating ? (
                                        <TextField
                                            label="Role Name"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            size="small"
                                        />
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ mr: 2 }}>{selectedRole}</Typography>
                                            <Button size="small" startIcon={<VisibilityIcon />} onClick={handleShowRoleId} sx={{ mr: 1 }}>
                                                RoleID
                                            </Button>
                                            <Button size="small" startIcon={<VpnKeyIcon />} onClick={handleGenerateSecretId}>
                                                SecretID
                                            </Button>
                                        </Box>
                                    )}
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSave}
                                        disabled={isCreating && !roleName}
                                    >
                                        Save
                                    </Button>
                                </Box>

                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Token Policies (comma separated)"
                                            fullWidth
                                            value={tokenPolicies}
                                            onChange={(e) => setTokenPolicies(e.target.value)}
                                            helperText="e.g. default, my-policy"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Token TTL"
                                            fullWidth
                                            value={tokenTtl}
                                            onChange={(e) => setTokenTtl(e.target.value)}
                                            helperText="e.g. 1h"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Token Max TTL"
                                            fullWidth
                                            value={tokenMaxTtl}
                                            onChange={(e) => setTokenMaxTtl(e.target.value)}
                                            helperText="e.g. 24h"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Secret ID TTL"
                                            fullWidth
                                            value={secretIdTtl}
                                            onChange={(e) => setSecretIdTtl(e.target.value)}
                                            helperText="e.g. 10m"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Secret ID Num Uses"
                                            fullWidth
                                            type="number"
                                            value={secretIdNumUses}
                                            onChange={(e) => setSecretIdNumUses(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography color="textSecondary">Select a role to edit or create new.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* RoleID Dialog */}
            <Dialog open={roleIdDialog} onClose={() => setRoleIdDialog(false)}>
                <DialogTitle>Role ID</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'monospace', mr: 2 }}>{fetchedRoleId}</Typography>
                        <IconButton onClick={() => navigator.clipboard.writeText(fetchedRoleId)}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleIdDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* SecretID Dialog */}
            <Dialog open={secretIdDialog} onClose={() => setSecretIdDialog(false)}>
                <DialogTitle>New Secret ID</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    {generatedSecretId && (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="textSecondary">Secret ID</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="h6" sx={{ fontFamily: 'monospace', mr: 2, flexGrow: 1, overflowWrap: 'anywhere' }}>
                                        {generatedSecretId.secret_id}
                                    </Typography>
                                    <IconButton onClick={() => navigator.clipboard.writeText(generatedSecretId.secret_id)}>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="textSecondary">Accessor</Typography>
                                    <Typography variant="body2">{generatedSecretId.secret_id_accessor}</Typography>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSecretIdDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AppRoles;
