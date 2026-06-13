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
    const baseClass = "flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 border border-transparent";
    if (activePage === pageName) {
      return `${baseClass} bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 border-indigo-500/20 translate-x-1`;
    }
    return `${baseClass} text-slate-400 hover:bg-slate-900/40 hover:text-white hover:border-slate-800/30 hover:translate-x-1`;
  };

  return (
    <>
      {/* Mobile Sidebar Overlay Dimmer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Desktop: Sticky | Mobile: Drawer) */}
      <aside className={`w-[260px] bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between border-r border-slate-900/60 fixed md:sticky top-0 h-screen z-50 transition-transform duration-300 ease-in-out md:translate-x-0 shrink-0 ${
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900/60 text-indigo-400">
            <div className="flex items-center space-x-2">
              <Scale className="h-7 w-7" />
              <span className="text-xl font-extrabold text-white tracking-wider">LexAI</span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1.5">
            <Link 
              to="/dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('dashboard')}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/documents" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('documents')}
            >
              <FileText className="h-5 w-5" />
              <span>My Documents</span>
            </Link>
            <Link 
              to="/upload" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('upload')}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Document</span>
            </Link>
            <Link 
              to="/profile" 
              onClick={() => setIsSidebarOpen(false)}
              className={getNavLinkClass('profile')}
            >
              <User className="h-5 w-5" />
              <span>My Profile</span>
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                onClick={() => setIsSidebarOpen(false)}
                className={getNavLinkClass('admin')}
              >
                <BarChart2 className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-900/60 space-y-4">
          <Link 
            to="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-slate-900/40 border border-transparent hover:border-slate-800/40 transition duration-150"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md border border-slate-700/50 transform hover:scale-105 transition-transform duration-200 shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'User Profile'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 border border-rose-500/10 hover:border-rose-500/20 transition duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
