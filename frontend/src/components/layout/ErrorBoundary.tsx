import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                    <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Something went wrong
                        </Typography>
                        <Typography color="textSecondary" paragraph>
                            The application encountered an unexpected error.
                        </Typography>
                        {this.state.error && (
                            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.default', border: '1px solid #ccc', borderRadius: 1, overflow: 'auto' }}>
                                <Typography variant="caption" fontFamily="monospace" color="error">
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
