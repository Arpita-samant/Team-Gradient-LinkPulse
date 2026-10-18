import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/DashboardLayout';

import LandingPage from './pages/LandingPage';
import CreateLinkPage from './pages/CreateLinkPage';
import QrGeneratorPage from './pages/QrGeneratorPage';
import LinkManagementPage from './pages/LinkManagementPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import PasswordPromptPage from './pages/PasswordPromptPage';
import LinkStatusPage from './pages/LinkStatusPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/analytics" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Dashboard Layout Views */}
            <Route element={<DashboardLayout />}>
              <Route
                path="/create-link"
                element={
                  <ProtectedRoute>
                    <CreateLinkPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/qr-generator" element={<QrGeneratorPage />} />
              <Route
                path="/links"
                element={
                  <ProtectedRoute>
                    <LinkManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanelPage />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Password protected link challenge view */}
            <Route path="/p/:shortCode" element={<PasswordPromptPage />} />

            {/* Link security status notification */}
            <Route path="/link-status" element={<LinkStatusPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/link-status?type=not-found" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
