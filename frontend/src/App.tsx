import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Vaults from './pages/Vaults';
import Secrets from './pages/Secrets';
import Policies from './pages/Policies';
import Tokens from './pages/Tokens';
import AppRoles from './pages/AppRoles';
import VaultDashboard from './pages/VaultDashboard';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { createTheme, ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? (
    <>
      <Navbar />
      {children}
    </>
  ) : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={<Navigate to="/vaults" />}
              />
              <Route
                path="/vaults"
                element={
                  <PrivateRoute>
                    <Vaults />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vaults/:id/dashboard"
                element={
                  <PrivateRoute>
                    <VaultDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vaults/:id/secrets"
                element={
                  <PrivateRoute>
                    <Secrets />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vaults/:id/policies"
                element={
                  <PrivateRoute>
                    <Policies />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vaults/:id/tokens"
                element={
                  <PrivateRoute>
                    <Tokens />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vaults/:id/approles"
                element={
                  <PrivateRoute>
                    <AppRoles />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
