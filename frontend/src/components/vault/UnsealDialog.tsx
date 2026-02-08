import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface UnsealDialogProps {
    open: boolean;
    onClose: () => void;
    onUnseal: (keys: string[]) => Promise<void>;
}

const UnsealDialog: React.FC<UnsealDialogProps> = ({ open, onClose, onUnseal }) => {
    const [keys, setKeys] = useState<string[]>(['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleKeyChange = (index: number, value: string) => {
        const newKeys = [...keys];
        newKeys[index] = value;
        setKeys(newKeys);
    };

    const addKeyField = () => {
        setKeys([...keys, '']);
    };

    const removeKeyField = (index: number) => {
        if (keys.length > 1) {
            const newKeys = keys.filter((_, i) => i !== index);
            setKeys(newKeys);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Filter out empty keys
            const validKeys = keys.filter(k => k.trim() !== '');
            if (validKeys.length === 0) {
                setError("Please enter at least one key");
                setLoading(false);
                return;
            }
            await onUnseal(validKeys);
            setKeys(['']);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Unseal failed. Please checking your keys.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Unseal Vault</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" gutterBottom color="textSecondary">
                        Enter your unseal keys (shares) below. Depending on your configuration, you may need multiple keys.
                    </Typography>

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    {keys.map((key, index) => (
                        <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                            <TextField
                                fullWidth
                                label={`Unseal Key ${index + 1}`}
                                type="password"
                                value={key}
                                onChange={(e) => handleKeyChange(index, e.target.value)}
                                autoFocus={index === 0}
                            />
                            {keys.length > 1 && (
                                <IconButton onClick={() => removeKeyField(index)} sx={{ ml: 1 }}>
                                    <RemoveIcon />
                                </IconButton>
                            )}
                        </Box>
                    ))}

                    <Button startIcon={<AddIcon />} onClick={addKeyField} size="small">
                        Add Another Key
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Unsealing...' : 'Unseal'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UnsealDialog;
