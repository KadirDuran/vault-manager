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
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useParams } from 'react-router-dom';
import { vaultService } from '../services/vaultService';

const Policies: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const vaultId = id ? parseInt(id) : 0;

    const [policies, setPolicies] = useState<string[]>([]);
    const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
    const [policyRules, setPolicyRules] = useState<string>('');
    const [newPolicyName, setNewPolicyName] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (vaultId) loadPolicies();
    }, [vaultId]);

    const loadPolicies = async () => {
        try {
            const list = await vaultService.listPolicies(vaultId);
            setPolicies(list);
        } catch (err) {
            console.error(err);
            setError("Failed to list policies");
        }
    };

    const handleSelectPolicy = async (name: string) => {
        setSelectedPolicy(name);
        setIsCreating(false);
        setNewPolicyName('');
        setError('');
        setSuccess('');
        try {
            const rules = await vaultService.readPolicy(vaultId, name);
            setPolicyRules(rules);
        } catch (err) {
            setError("Failed to read policy rules");
            setPolicyRules('');
        }
    };

    const handleCreateNew = () => {
        setSelectedPolicy(null);
        setIsCreating(true);
        setNewPolicyName('');
        setPolicyRules(''); // Start empty or with template
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        const nameToSave = isCreating ? newPolicyName : selectedPolicy;
        if (!nameToSave) return;

        try {
            await vaultService.setPolicy(vaultId, nameToSave, policyRules);
            setSuccess(`Policy ${nameToSave} saved successfully.`);
            loadPolicies();
            if (isCreating) {
                setIsCreating(false);
                setSelectedPolicy(nameToSave);
            }
        } catch (err) {
            setError("Failed to save policy");
        }
    };

    const handleDelete = async (name: string) => {
        if (!window.confirm(`Delete policy ${name}?`)) return;
        try {
            await vaultService.deletePolicy(vaultId, name);
            if (selectedPolicy === name) {
                setSelectedPolicy(null);
                setPolicyRules('');
            }
            loadPolicies();
        } catch (err) {
            setError("Failed to delete policy");
        }
    };

    if (!vaultId) return <Typography>Invalid Vault ID</Typography>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '80vh' }}>
            <Typography variant="h5" gutterBottom>Policy Management</Typography>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ height: '100%', overflow: 'auto' }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Policies</Typography>
                            <Button startIcon={<AddIcon />} size="small" onClick={handleCreateNew}>New</Button>
                        </Box>
                        <List>
                            {policies.map(policy => (
                                <ListItem
                                    key={policy}
                                    disablePadding
                                >
                                    <ListItemButton
                                        selected={selectedPolicy === policy}
                                        onClick={() => handleSelectPolicy(policy)}
                                    >
                                        <ListItemText primary={policy} />
                                    </ListItemButton>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" size="small" onClick={() => handleDelete(policy)}>
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
                        {(selectedPolicy || isCreating) ? (
                            <>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {isCreating ? (
                                        <TextField
                                            label="Policy Name"
                                            value={newPolicyName}
                                            onChange={(e) => setNewPolicyName(e.target.value)}
                                            size="small"
                                        />
                                    ) : (
                                        <Typography variant="h6">{selectedPolicy}</Typography>
                                    )}
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSave}
                                        disabled={isCreating && !newPolicyName}
                                    >
                                        Save
                                    </Button>
                                </Box>

                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                                <TextField
                                    label="Policy Rules (HCL)"
                                    multiline
                                    fullWidth
                                    rows={20}
                                    value={policyRules}
                                    onChange={(e) => setPolicyRules(e.target.value)}
                                    sx={{ fontFamily: 'monospace', flexGrow: 1 }}
                                    InputProps={{ style: { fontFamily: 'monospace' } }}
                                />
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography color="textSecondary">Select a policy to edit or create new.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Policies;
