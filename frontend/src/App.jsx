import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import DashboardPage from './pages/DashboardPage';
import EnrollmentPage from './pages/EnrollmentPage';
import CertificatePage from './pages/CertificatePage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SubscribePage from './pages/SubscribePage';
import NotFoundPage from './pages/NotFoundPage';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          style: { background: '#fff', color: '#12131A', border: '1px solid #ECECEF', boxShadow: '0 8px 28px rgba(20,20,30,0.10)', fontWeight: 600 },
          success: { iconTheme: { primary: '#FF5722', secondary: '#fff' } },
        }} />
        <Navbar />
        <div style={{ minHeight: '70vh' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/desafios/:slug" element={<ChallengeDetailPage />} />
            <Route path="/desafios/:slug/ranking" element={<RankingPage />} />
            <Route path="/dashboard" element={<Private><DashboardPage /></Private>} />
            <Route path="/inscricoes/:id" element={<Private><EnrollmentPage /></Private>} />
            <Route path="/inscricoes/:id/certificado" element={<Private><CertificatePage /></Private>} />
            <Route path="/perfil" element={<Private><ProfilePage /></Private>} />
            <Route path="/assinar" element={<Private><SubscribePage /></Private>} />
            <Route path="/admin" element={<AdminOnly><AdminPage /></AdminOnly>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
