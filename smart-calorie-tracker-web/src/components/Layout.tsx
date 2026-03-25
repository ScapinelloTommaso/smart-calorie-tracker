import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import CookieBanner from './CookieBanner';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fafafaba] dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] rounded-t-[2.5rem] border-t border-slate-50 dark:border-slate-700/50 z-50 transition-colors duration-300">
        <div className="max-w-md mx-auto px-8 h-20 flex justify-around items-center">
          <Link to="/" className={`flex flex-col items-center p-3 rounded-2xl transition-all active:scale-90 ${location.pathname === '/' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
            <Home size={26} strokeWidth={2.5} />
          </Link>
          <Link to="/profile" className={`flex flex-col items-center p-3 rounded-2xl transition-all active:scale-90 ${location.pathname === '/profile' ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/20 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
            <User size={26} strokeWidth={2.5} />
          </Link>
        </div>
      </nav>

      <CookieBanner />
    </div>
  );
}
