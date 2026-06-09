import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import Brand from './pages/Brand';
import SocialLinks from './pages/SocialLinks';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Media from './pages/Media';
import Pages from './pages/Pages';
import Blog from './pages/Blog';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import SEO from './pages/SEO';
import Forms from './pages/Forms';
import TeamMembers from './pages/TeamMembers';
import Services from './pages/Services';
import CaseStudies from './pages/CaseStudies';
import HomepageStats from './pages/HomepageStats';
import AboutValues from './pages/AboutValues';
import AboutStats from './pages/AboutStats';
import GlobalBlocks from './pages/GlobalBlocks';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
          <Route path="/brand" element={<ProtectedRoute><Brand /></ProtectedRoute>} />
          <Route path="/social-links" element={<ProtectedRoute><SocialLinks /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
          <Route path="/pages" element={<ProtectedRoute><Pages /></ProtectedRoute>} />
          <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
          <Route path="/navbar" element={<ProtectedRoute><Navbar /></ProtectedRoute>} />
          <Route path="/footer" element={<ProtectedRoute><Footer /></ProtectedRoute>} />
          <Route path="/seo" element={<ProtectedRoute><SEO /></ProtectedRoute>} />
          <Route path="/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
          <Route path="/team-members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/case-studies" element={<ProtectedRoute><CaseStudies /></ProtectedRoute>} />
          <Route path="/homepage-stats" element={<ProtectedRoute><HomepageStats /></ProtectedRoute>} />
          <Route path="/about-values" element={<ProtectedRoute><AboutValues /></ProtectedRoute>} />
          <Route path="/about-stats" element={<ProtectedRoute><AboutStats /></ProtectedRoute>} />
          <Route path="/global-blocks" element={<ProtectedRoute><GlobalBlocks /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
