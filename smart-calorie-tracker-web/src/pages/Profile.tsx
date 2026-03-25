import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Save, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const { logout, updateUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [profile, setProfile] = useState({
    username: '',
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbsGoal: 200,
    dailyFatsGoal: 60
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setProfile({
        username: data.username,
        dailyCalorieGoal: data.dailyCalorieGoal || 2000,
        dailyProteinGoal: data.dailyProteinGoal || 150,
        dailyCarbsGoal: data.dailyCarbsGoal || 200,
        dailyFatsGoal: data.dailyFatsGoal || 60
      });
      updateUser(data);
    } catch (err) {
      console.error("Errore fetch profilo", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await api.put('/user/profile', {
        DailyCalorieGoal: Number(profile.dailyCalorieGoal),
        DailyProteinGoal: Number(profile.dailyProteinGoal),
        DailyCarbsGoal: Number(profile.dailyCarbsGoal),
        DailyFatsGoal: Number(profile.dailyFatsGoal)
      });
      // Sync global state immediately after successful PUT
      updateUser({
        dailyCalorieGoal: Number(profile.dailyCalorieGoal),
        dailyProteinGoal: Number(profile.dailyProteinGoal),
        dailyCarbsGoal: Number(profile.dailyCarbsGoal),
        dailyFatsGoal: Number(profile.dailyFatsGoal)
      });
      setSuccessMsg("Obiettivi salvati con successo! 🎉");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-40">
        <Loader2 size={40} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-12 font-sans text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="bg-cyan-100 dark:bg-cyan-900/40 p-4 rounded-[1.75rem] text-cyan-600 dark:text-cyan-400 shadow-inner">
            <UserIcon size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Ciao, {profile.username}!</h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Gestisci il tuo piano</p>
          </div>
        </div>
      </header>

      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 mb-8 border border-slate-50 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">I miei Obiettivi</h2>
        
        <form onSubmit={handleSave} className="space-y-5">
          
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1">Calorie Giornaliere (kcal)</label>
            <input 
              type="number" 
              name="dailyCalorieGoal"
              value={profile.dailyCalorieGoal}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 font-bold outline-none text-xl transition-colors focus:bg-gray-100 dark:focus:bg-slate-950"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1">Carboidrati</label>
              <input 
                type="number" 
                name="dailyCarbsGoal"
                value={profile.dailyCarbsGoal}
                onChange={handleChange}
                className="w-full bg-cyan-50/50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-none rounded-xl p-3 font-bold outline-none text-center focus:bg-cyan-50 dark:focus:bg-cyan-900/40"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1">Proteine</label>
              <input 
                type="number" 
                name="dailyProteinGoal"
                value={profile.dailyProteinGoal}
                onChange={handleChange}
                className="w-full bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-none rounded-xl p-3 font-bold outline-none text-center focus:bg-emerald-50 dark:focus:bg-emerald-900/40"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1">Grassi</label>
              <input 
                type="number" 
                name="dailyFatsGoal"
                value={profile.dailyFatsGoal}
                onChange={handleChange}
                className="w-full bg-rose-50/50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-none rounded-xl p-3 font-bold outline-none text-center focus:bg-rose-50 dark:focus:bg-rose-900/40"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-emerald-400 dark:bg-emerald-500 text-white font-extrabold rounded-[1.25rem] p-4 hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-emerald-400/30 dark:shadow-emerald-500/20"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} strokeWidth={2.5} /> Salva Modifiche</>}
            </button>
            
            {successMsg && (
              <p className="text-center text-emerald-500 dark:text-emerald-400 font-bold text-sm mt-4 animate-in fade-in zoom-in-95 duration-300">
                {successMsg}
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="mb-20 px-2">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-rose-400 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 p-4 rounded-[1.5rem] font-extrabold transition-all active:scale-95"
        >
          <LogOut size={20} strokeWidth={2.5} /> Logout
        </button>
      </section>
    </div>
  );
}
