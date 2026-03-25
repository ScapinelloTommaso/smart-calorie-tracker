import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors duration-300">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-8">Bentornato!</h1>
        
        {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-400 outline-none transition-shadow"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-400 outline-none transition-shadow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-400 dark:bg-emerald-500 text-white font-bold rounded-xl p-4 hover:bg-emerald-500 transition-colors mt-2 cursor-pointer active:scale-[0.98]"
          >
            Accedi
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          Non hai un account? <Link to="/register" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 font-bold">Registrati</Link>
        </p>

        <div className="flex justify-center gap-4 mt-4">
          <Link to="/privacy" className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 uppercase tracking-wider transition-colors">Privacy</Link>
          <Link to="/terms" className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 uppercase tracking-wider transition-colors">Termini</Link>
        </div>
      </div>
    </div>
  );
}
