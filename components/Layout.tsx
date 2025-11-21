import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, ShoppingBag, User as UserIcon, Home, Zap, Shield, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME, DISCORD_INVITE_LINK, CURRENCY_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
      active 
        ? 'bg-white/10 text-white shadow-lg shadow-white/5' 
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#111] text-gray-100 font-sans flex flex-col bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      {/* Navbar */}
      <nav className="bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-rcn-red to-red-800 p-2 rounded-lg shadow-lg shadow-red-900/20">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white flex flex-col leading-none">
              <span>{APP_NAME}</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase opacity-70">Creator Network</span>
            </span>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-1 bg-black/20 p-1 rounded-lg border border-white/5">
              <NavItem to="/" icon={Home} label="Feed" active={location.pathname === '/'} />
              <NavItem to="/shop" icon={ShoppingBag} label="Market" active={location.pathname === '/shop'} />
              <NavItem to="/profile" icon={UserIcon} label="Profile" active={location.pathname === '/profile'} />
              {user.role === UserRole.ADMIN && (
                  <NavItem to="/admin" icon={Shield} label="Admin" active={location.pathname === '/admin'} />
              )}
            </div>
          )}

          <div className="flex items-center space-x-4">
             <a href={DISCORD_INVITE_LINK} target="_blank" rel="noreferrer" className="hidden sm:flex items-center space-x-2 text-xs font-bold bg-discord-primary hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors">
                <ExternalLink size={14} />
                <span>Join Discord</span>
             </a>

            {user ? (
              <div className="flex items-center space-x-4 border-l border-white/10 pl-4">
                <div className="flex flex-col items-end hidden sm:flex">
                  <div className={`text-sm font-bold flex items-center ${user.role === UserRole.ADMIN ? 'text-red-500' : 'text-white'}`}>
                      {user.username}
                      {user.role === UserRole.ADMIN && <Shield size={12} className="ml-1 fill-current" />}
                  </div>
                  <span className="text-xs text-discord-gold font-mono">{user.coins.toLocaleString()} {CURRENCY_NAME}</span>
                </div>
                <Link to="/profile">
                    <img 
                    src={user.avatarUrl} 
                    alt="avatar" 
                    className={`w-10 h-10 rounded-lg border-2 border-white/10 object-cover bg-black transition-transform hover:scale-110 ${user.equipped.avatarFrame ? 'ring-2 ring-offset-2 ring-offset-black ' + user.equipped.avatarFrame : ''}`} 
                    />
                </Link>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-rcn-red hover:bg-white/5 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Guest Mode</span>
            )}
          </div>
        </div>
      </nav>
      
      {/* Mobile Nav Bottom */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe shadow-2xl">
          <div className="flex justify-around p-3">
             <Link to="/" className={location.pathname === '/' ? 'text-white' : 'text-gray-500'}>
               <Home size={24} />
             </Link>
             <Link to="/shop" className={location.pathname === '/shop' ? 'text-white' : 'text-gray-500'}>
               <ShoppingBag size={24} />
             </Link>
             <Link to="/profile" className={location.pathname === '/profile' ? 'text-white' : 'text-gray-500'}>
               <UserIcon size={24} />
             </Link>
             {user.role === UserRole.ADMIN && (
                 <Link to="/admin" className={location.pathname === '/admin' ? 'text-red-500' : 'text-gray-500'}>
                    <Shield size={24} />
                 </Link>
             )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;