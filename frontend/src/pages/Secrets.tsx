import React, { useState } from 'react';
import { Box, Grid, Container, Typography, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import SecretTree from '../components/secret/SecretTree';
import SecretDetail from '../components/secret/SecretDetail';

const Secrets: React.FC = () => {
    // We expect vaultId to be passed somehow, maybe path param /vaults/:id/secrets
    // For now assuming we come from a route like /vaults/:id/secrets
    const { id } = useParams<{ id: string }>();
    const vaultId = id ? parseInt(id) : 0;

    const [selectedMount, setSelectedMount] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    const handleSelectSecret = (mount: string, path: string) => {
        setSelectedMount(mount);
        setSelectedPath(path);
    };

    const handleSecretDeleted = () => {
        setSelectedMount(null);
        setSelectedPath(null);
        // Ideally trigger tree refresh here
    };

    if (!vaultId) {
        return <Typography>Invalid Vault ID</Typography>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '80vh' }}>
            <Typography variant="h5" gutterBottom>Secret Explorer</Typography>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', overflow: 'auto' }}>
                        <SecretTree vaultId={vaultId} onSelectSecret={handleSelectSecret} />
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
                    <SecretDetail
                        vaultId={vaultId}
                        mountPoint={selectedMount}
                        path={selectedPath}
                        onDelete={handleSecretDeleted}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Secrets;
