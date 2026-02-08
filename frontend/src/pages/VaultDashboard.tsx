import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Chip,
    Button,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Divider,
    LinearProgress
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { vaultService } from '../services/vaultService';
import DnsIcon from '@mui/icons-material/Dns';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PolicyIcon from '@mui/icons-material/Policy';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AppsIcon from '@mui/icons-material/Apps';

const VaultDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const vaultId = id ? parseInt(id) : 0;
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (vaultId) loadOverview();
    }, [vaultId]);

    const loadOverview = async () => {
        try {
            const data = await vaultService.getOverview(vaultId);
            setOverview(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LinearProgress />;
    if (error) return <Container sx={{ mt: 4 }}><Typography color="error">{error}</Typography></Container>;
    if (!overview) return null;

    const { health, seal_status, mounts, auth_methods, policies } = overview;
    const isSealed = seal_status.sealed;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        Dashboard
                        {isSealed ?
                            <Chip icon={<LockIcon />} label="Sealed" color="error" sx={{ ml: 2 }} /> :
                            <Chip icon={<LockOpenIcon />} label="Unsealed" color="success" sx={{ ml: 2 }} />
                        }
                    </Typography>
                    <Typography color="textSecondary">
                        Cluster: {overview.cluster_name} • Version: {overview.version}
                    </Typography>
                </Box>
                <Button variant="outlined" onClick={loadOverview}>Refresh</Button>
            </Box>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <VpnKeyIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4">{Object.keys(mounts || {}).length}</Typography>
                                <Typography variant="body2" color="textSecondary">Secrets Engines</Typography>
                            </Box>
                        </CardContent>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            <Button size="small" endIcon={<ArrowForwardIcon />} component={Link} to={`/vaults/${vaultId}/secrets`}>
                                Manage Secrets
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                                <PolicyIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4">{policies ? policies.length : 0}</Typography>
                                <Typography variant="body2" color="textSecondary">Policies</Typography>
                            </Box>
                        </CardContent>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            <Button size="small" endIcon={<ArrowForwardIcon />} component={Link} to={`/vaults/${vaultId}/policies`}>
                                Manage Policies
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                <AppsIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4">-</Typography>
                                <Typography variant="body2" color="textSecondary">AppRoles</Typography>
                            </Box>
                        </CardContent>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            <Button size="small" endIcon={<ArrowForwardIcon />} component={Link} to={`/vaults/${vaultId}/approles`}>
                                Manage AppRoles
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                <AdminPanelSettingsIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h4">{Object.keys(auth_methods || {}).length}</Typography>
                                <Typography variant="body2" color="textSecondary">Auth Methods</Typography>
                            </Box>
                        </CardContent>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            <Typography variant="caption" color="textSecondary">Managed via CLI/API</Typography>
                        </Box>
                    </Card>
                </Grid>


                {/* Detailed Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <DnsIcon sx={{ mr: 1 }} /> Mounted Secrets Engines
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {Object.entries(mounts || {}).map(([path, info]: [string, any]) => (
                                <Box key={path} sx={{ mb: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{path}</Typography>
                                        <Chip label={info.type} size="small" color="primary" variant="outlined" />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{info.description || 'No description'}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                            <HealthAndSafetyIcon sx={{ mr: 1 }} /> System Health
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 6 }}>
                                <Typography color="textSecondary" variant="caption">Initialized</Typography>
                                <Typography variant="body1">{health.initialized ? 'Yes' : 'No'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography color="textSecondary" variant="caption">Sealed</Typography>
                                <Typography variant="body1" color={health.sealed ? 'error.main' : 'success.main'}>
                                    {health.sealed ? 'Yes' : 'No'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography color="textSecondary" variant="caption">Standby</Typography>
                                <Typography variant="body1">{health.standby ? 'Yes' : 'No'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography color="textSecondary" variant="caption">Performance Standby</Typography>
                                <Typography variant="body1">{health.performance_standby ? 'Yes' : 'No'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography color="textSecondary" variant="caption">Replication Performance Mode</Typography>
                                <Typography variant="body1">{health.replication_performance_mode}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography color="textSecondary" variant="caption">Server Time</Typography>
                                <Typography variant="body2">{new Date(health.server_time_utc * 1000).toLocaleString()}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default VaultDashboard;
