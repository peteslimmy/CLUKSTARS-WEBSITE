import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Image,
  Link2,
  Menu,
  X,
  LogOut,
  Building2,
  FileText,
  Newspaper,
  PanelTop,
  Layout as LayoutIcon,
  Search,
  Inbox,
  UsersRound,
  Wrench,
  Briefcase,
  BarChart3,
  Heart,
  TrendingUp,
  Box,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/organization', label: 'Organization', icon: Building2 },
  { href: '/brand', label: 'Brand Settings', icon: Settings },
  { href: '/social-links', label: 'Social Links', icon: Link2 },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/roles', label: 'Roles & Permissions', icon: Shield },
  { href: '/media', label: 'Media Library', icon: Image },
  { href: '/pages', label: 'Pages', icon: FileText },
  { href: '/blog', label: 'Blog Posts', icon: Newspaper },
  { href: '/navbar', label: 'Navbar', icon: PanelTop },
  { href: '/footer', label: 'Footer', icon: LayoutIcon },
  { href: '/seo', label: 'SEO & Analytics', icon: Search },
  { href: '/team-members', label: 'Team Members', icon: UsersRound },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/case-studies', label: 'Case Studies', icon: Briefcase },
  { href: '/homepage-stats', label: 'Homepage Stats', icon: BarChart3 },
  { href: '/about-values', label: 'About Values', icon: Heart },
  { href: '/about-stats', label: 'About Stats', icon: TrendingUp },
  { href: '/global-blocks', label: 'Global Blocks', icon: Box },
  { href: '/forms', label: 'Form Submissions', icon: Inbox },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <Link to="/" className="text-xl font-bold tracking-tight">CLUKSTARS CMS</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-slate-800 rounded">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed pointer-events-none'
                    : active
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
