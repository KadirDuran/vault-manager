import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Grid,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BlockIcon from '@mui/icons-material/Block';
import { useParams } from 'react-router-dom';
import { vaultService } from '../services/vaultService';

const Tokens: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const vaultId = id ? parseInt(id) : 0;

    // Issue Token State
    const [policies, setPolicies] = useState('');
    const [ttl, setTtl] = useState('1h');
    const [renewable, setRenewable] = useState(true);
    const [displayName, setDisplayName] = useState('vault-manager-user');

    // Result State
    const [generatedToken, setGeneratedToken] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Revoke State
    const [revokeTokenId, setRevokeTokenId] = useState('');
    const [revokeSuccess, setRevokeSuccess] = useState('');

    const handleCreateToken = async () => {
        setError('');
        setSuccess('');
        setGeneratedToken(null);
        try {
            const policyList = policies.split(',').map(p => p.trim()).filter(p => p);
            const params = {
                policies: policyList.length > 0 ? policyList : null,
                ttl,
                renewable,
                display_name: displayName
            };
            const result = await vaultService.createToken(vaultId, params);
            setGeneratedToken(result);
            setSuccess("Token generated successfully.");
        } catch (err) {
            console.error(err);
            setError("Failed to generate token.");
        }
    };

    const handleRevokeToken = async () => {
        setRevokeSuccess('');
        try {
            await vaultService.revokeToken(vaultId, revokeTokenId);
            setRevokeSuccess("Token revoked successfully.");
            setRevokeTokenId('');
        } catch (err) {
            setError("Failed to revoke token.");
        }
    };

    if (!vaultId) return <Typography>Invalid Vault ID</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Token Management</Typography>

            {/* Generate Token Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VpnKeyIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Issue New Token</Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Policies (comma separated)"
                            fullWidth
                            value={policies}
                            onChange={(e) => setPolicies(e.target.value)}
                            helperText="e.g. default, my-policy"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="TTL"
                            fullWidth
                            value={ttl}
                            onChange={(e) => setTtl(e.target.value)}
                            helperText="e.g. 1h, 24h"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Display Name"
                            fullWidth
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={<Checkbox checked={renewable} onChange={(e) => setRenewable(e.target.checked)} />}
                            label="Renewable"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button variant="contained" onClick={handleCreateToken}>Generate Token</Button>
                    </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                {generatedToken && (
                    <Card variant="outlined" sx={{ mt: 3, bgcolor: 'background.default' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Client Token</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontFamily: 'monospace', mr: 2, flexGrow: 1, overflowWrap: 'anywhere' }}>
                                    {generatedToken.auth.client_token}
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={() => navigator.clipboard.writeText(generatedToken.auth.client_token)}
                                >
                                    Copy
                                </Button>
                            </Box>

                            <Grid container spacing={1}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="textSecondary">Accessor</Typography>
                                    <Typography variant="body2">{generatedToken.auth.accessor}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="textSecondary">Lease Duration</Typography>
                                    <Typography variant="body2">{generatedToken.auth.lease_duration}s</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="textSecondary">Policies</Typography>
                                    <Box>
                                        {generatedToken.auth.policies.map((p: string) => (
                                            <Typography key={p} component="span" variant="body2" sx={{ mr: 1, bgcolor: 'action.selected', px: 0.5, borderRadius: 1 }}>
                                                {p}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}
            </Paper>

            {/* Revoke Token Section */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BlockIcon sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6">Revoke Token</Typography>
                </Box>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                            label="Token to Revoke"
                            fullWidth
                            value={revokeTokenId}
                            onChange={(e) => setRevokeTokenId(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Button variant="contained" color="error" fullWidth onClick={handleRevokeToken}>
                            Revoke
                        </Button>
                    </Grid>
                </Grid>
                {revokeSuccess && <Alert severity="success" sx={{ mt: 2 }}>{revokeSuccess}</Alert>}
            </Paper>

        </Container>
    );
};

export default Tokens;
