import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, 
  LayoutDashboard, 
  FileText, 
  Upload, 
  User, 
  LogOut, 
  X,
  BarChart2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ activePage, isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getNavLinkClass = (pageName) => {
    const baseClass = "group flex items-center space-x-3 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all duration-150 border";
    if (activePage === pageName) {
      return `${baseClass} bg-[#181A1F] text-[#F4F3EF] border-[#2A2C34] shadow-sm font-semibold`;
    }
    return `${baseClass} text-[#8E8D88] hover:text-[#F4F3EF] hover:bg-[#131518] hover:border-[#202227] border-transparent`;
  };

  return (
    <>
      {/* Mobile Sidebar Overlay Dimmer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/75 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Desktop: Sticky | Mobile: Drawer) */}
      <aside className={`w-[260px] bg-[#0E0F12] flex flex-col justify-between border-r border-[#202227] fixed md:sticky top-0 h-screen z-50 transition-transform duration-200 ease-in-out md:translate-x-0 shrink-0 ${
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo & Chambers Seal */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#202227]">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] group-hover:border-[#D97706]/40 transition">
                <Scale className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
                <span className="block text-[9px] uppercase tracking-widest font-mono text-[#8E8D88]">Chambers AI</span>
              </div>
            </Link>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 text-[#8E8D88] hover:text-white hover:bg-[#181A1F] rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 pt-5 pb-2">
            <span className="px-2 text-[10px] uppercase tracking-widest font-mono text-[#575652] font-semibold">Platform</span>
          </div>
          <nav className="px-3 space-y-1">
            <Link 
              to="/dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('dashboard')}
            >
              <LayoutDashboard className={`h-4 w-4 ${activePage === 'dashboard' ? 'text-[#D97706]' : 'text-[#8E8D88] group-hover:text-[#F4F3EF]'}`} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/documents" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('documents')}
            >
              <FileText className={`h-4 w-4 ${activePage === 'documents' ? 'text-[#D97706]' : 'text-[#8E8D88] group-hover:text-[#F4F3EF]'}`} />
              <span>My Documents</span>
            </Link>
            <Link 
              to="/upload" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('upload')}
            >
              <Upload className={`h-4 w-4 ${activePage === 'upload' ? 'text-[#D97706]' : 'text-[#8E8D88] group-hover:text-[#F4F3EF]'}`} />
              <span>Upload Document</span>
            </Link>
            <Link 
              to="/profile" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('profile')}
            >
              <User className={`h-4 w-4 ${activePage === 'profile' ? 'text-[#D97706]' : 'text-[#8E8D88] group-hover:text-[#F4F3EF]'}`} />
              <span>My Profile</span>
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                onClick={() => setIsSidebarOpen(false)}
                className={getNavLinkClass('admin')}
              >
                <BarChart2 className={`h-4 w-4 ${activePage === 'admin' ? 'text-[#D97706]' : 'text-[#8E8D88] group-hover:text-[#F4F3EF]'}`} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-3.5 border-t border-[#202227] space-y-2.5 bg-[#0A0B0D]/50">
          <Link 
            to="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#131518] border border-transparent hover:border-[#202227] transition"
          >
            <div className="h-8 w-8 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] font-mono text-xs font-semibold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F4F3EF] truncate">{user?.name || 'User Profile'}</p>
              <p className="text-[10px] text-[#8E8D88] font-mono truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg text-[#8E8D88] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
