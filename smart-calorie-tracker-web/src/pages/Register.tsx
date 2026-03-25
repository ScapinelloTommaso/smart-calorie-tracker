import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [calories, setCalories] = useState('2000');
  const [proteins, setProteins] = useState('150');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password, parseInt(calories), parseInt(proteins), 200, 60);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrazione fallita.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-sm border border-slate-100 p-8">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-8">Crea Account</h1>
        
        {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-cyan-400 outline-none transition-shadow"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-cyan-400 outline-none transition-shadow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Calorie (kcal)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none transition-shadow"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                min={500}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Proteine (g)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none transition-shadow"
                value={proteins}
                onChange={(e) => setProteins(e.target.value)}
                required
                min={0}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-cyan-400 text-white font-bold rounded-xl p-4 hover:bg-cyan-500 transition-colors mt-6 cursor-pointer active:scale-[0.98]"
          >
            Inizia Ora
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Hai già un account? <Link to="/login" className="text-cyan-500 hover:text-cyan-600 font-bold">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
