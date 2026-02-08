import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import { Vault } from '../../types';

interface VaultFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Vault;
}

const VaultForm: React.FC<VaultFormProps> = ({ open, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        auth_method: 'token',
        token: '',
        tags: '',
        unseal_key_1: '',
        unseal_key_2: '',
        unseal_key_3: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name as string]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        setFormData({
            name: '',
            url: '',
            description: '',
            auth_method: 'token',
            token: '',
            tags: '',
            unseal_key_1: '',
            unseal_key_2: '',
            unseal_key_3: ''
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Edit Vault' : 'Add New Vault'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Vault Name"
                        type="text"
                        fullWidth
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="url"
                        label="Vault URL"
                        type="url"
                        fullWidth
                        required
                        placeholder="http://127.0.0.1:8200"
                        value={formData.url}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <FormControl fullWidth margin="dense">
                        <InputLabel id="auth-method-label">Auth Method</InputLabel>
                        <Select
                            labelId="auth-method-label"
                            name="auth_method"
                            value={formData.auth_method}
                            label="Auth Method"
                            onChange={handleChange as any}
                        >
                            <MenuItem value="token">Token</MenuItem>
                            <MenuItem value="approle">AppRole</MenuItem>
                        </Select>
                    </FormControl>

                    {formData.auth_method === 'token' && (
                        <TextField
                            margin="dense"
                            name="token"
                            label="Vault Token"
                            type="password"
                            fullWidth
                            helperText="Leave empty if using unseal keys or if you want to provide it later"
                            value={formData.token}
                            onChange={handleChange}
                        />
                    )}

                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Unseal Keys (Required - 3 keys)
                        </Typography>
                    </Box>

                    <TextField
                        margin="dense"
                        name="unseal_key_1"
                        label="Unseal Key 1"
                        type="password"
                        fullWidth
                        required
                        value={formData.unseal_key_1}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="unseal_key_2"
                        label="Unseal Key 2"
                        type="password"
                        fullWidth
                        required
                        value={formData.unseal_key_2}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="unseal_key_3"
                        label="Unseal Key 3"
                        type="password"
                        fullWidth
                        required
                        value={formData.unseal_key_3}
                        onChange={handleChange}
                    />

                    <TextField
                        margin="dense"
                        name="tags"
                        label="Tags (comma separated)"
                        type="text"
                        fullWidth
                        placeholder="prod, eu-west-1"
                        value={formData.tags}
                        onChange={handleChange}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default VaultForm;
