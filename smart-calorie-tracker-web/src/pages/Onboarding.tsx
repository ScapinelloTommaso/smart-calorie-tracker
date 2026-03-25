import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import api from '../services/api';
import { ChevronRight, Target, Activity, Check, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const isGoogleFlow = searchParams.get('google') === 'true';
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Uomo');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  
  const [activity, setActivity] = useState('Sedentario');
  const [goal, setGoal] = useState('Mantenimento');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [macros, setMacros] = useState({ Calories: 2000, Proteins: 150, Carbs: 200, Fats: 60 });

  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  // If coming from Google flow, pre-fill username and skip to step 2 (or show body stats)
  useEffect(() => {
    if (isGoogleFlow) {
      const email = sessionStorage.getItem('googleEmail') || '';
      setUsername(email);
      // In Google flow, skip username/password step
    }
  }, [isGoogleFlow]);

  const handleCalculateMacros = async () => {
    if (!isGoogleFlow && (!username || !password)) {
      setError("Compila tutti i campi prima di procedere.");
      return;
    }
    if (!age || !height || !weight) {
      setError("Compila età, altezza e peso prima di procedere.");
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('http://localhost:5232/api/onboarding/calculate-macros', {
        Age: Number(age),
        Gender: gender,
        Height: Number(height),
        Weight: Number(weight),
        Activity: activity,
        Goal: goal
      });
      setMacros({
        Calories: Math.round(Number(data.Calories) || 0),
        Proteins: Math.round(Number(data.Proteins) || 0),
        Carbs: Math.round(Number(data.Carbs) || 0),
        Fats: Math.round(Number(data.Fats) || 0)
      });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore nel calcolo dei macro. Verifica la connessione API.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      if (isGoogleFlow) {
        // Google registration: call google-register with macro goals
        const credential = sessionStorage.getItem('googleCredential');
        if (!credential) {
          setError("Sessione Google scaduta. Torna al login e riprova.");
          setLoading(false);
          return;
        }

        const { data } = await api.post('/auth/google-register', {
          Credential: credential,
          DailyCalorieGoal: macros.Calories,
          DailyProteinGoal: macros.Proteins,
          DailyCarbsGoal: macros.Carbs,
          DailyFatsGoal: macros.Fats
        });

        localStorage.setItem('token', data.token);
        const userData = { id: data.userId, username: data.username };
        localStorage.setItem('user', JSON.stringify(userData));
        updateUser(userData);

        // Clean up session storage
        sessionStorage.removeItem('googleCredential');
        sessionStorage.removeItem('googleEmail');
        sessionStorage.removeItem('googleName');

        // Fetch full profile
        try {
          const { data: profile } = await api.get('/user/profile');
          updateUser(profile);
        } catch { /* silent */ }

        navigate('/');
      } else {
        // Traditional registration
        await register(username, password, macros.Calories, macros.Proteins, macros.Carbs, macros.Fats);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante la registrazione.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { data, status } = await api.post('/auth/google', {
        Credential: credentialResponse.credential
      });

      if (status === 202 && data.requiresOnboarding) {
        // Save temp data and stay on onboarding, jump to body stats
        sessionStorage.setItem('googleCredential', credentialResponse.credential);
        sessionStorage.setItem('googleEmail', data.email);
        sessionStorage.setItem('googleName', data.name);
        setUsername(data.email);
        setStep(2);
        return;
      }

      // Existing user → login directly
      localStorage.setItem('token', data.token);
      const userData = { id: data.userId, username: data.username };
      localStorage.setItem('user', JSON.stringify(userData));
      updateUser(userData);
      navigate('/');
      try {
        const { data: profile } = await api.get('/user/profile');
        updateUser(profile);
      } catch { /* silent */ }
    } catch (err: any) {
      if (err.response?.status === 202 && err.response?.data?.requiresOnboarding) {
        sessionStorage.setItem('googleCredential', credentialResponse.credential);
        sessionStorage.setItem('googleEmail', err.response.data.email);
        sessionStorage.setItem('googleName', err.response.data.name);
        setUsername(err.response.data.email);
        setStep(2);
        return;
      }
      setError(err.response?.data?.message || 'Errore durante la registrazione con Google.');
    }
  };

  const inputClass = "w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-400 outline-none transition-colors font-medium";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors duration-300">
        
        {/* Step 1 — Username/Password + Body Stats (skipped for Google flow) */}
        {step === 1 && !isGoogleFlow && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-1">Benvenuto!</h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium">Chi siamo e cosa facciamo?</p>
            
            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}
            
            <div className="space-y-4">
              <input type="text" placeholder="Scegli uno Username" className={inputClass} value={username} onChange={e => setUsername(e.target.value)} required />
              <input type="password" placeholder="Scegli una Password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <input type="number" placeholder="Età" className={inputClass} value={age} onChange={e => setAge(e.target.value)} required />
                <select className={`${inputClass} appearance-none cursor-pointer`} value={gender} onChange={e => setGender(e.target.value)}>
                  <option>Uomo</option>
                  <option>Donna</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Altezza (cm)" className={inputClass} value={height} onChange={e => setHeight(e.target.value)} required />
                <input type="number" placeholder="Peso (kg)" className={inputClass} value={weight} onChange={e => setWeight(e.target.value)} required />
              </div>

              <button 
                onClick={() => { setError(''); setStep(2); }} 
                className="w-full bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-2xl p-4 hover:bg-slate-700 dark:hover:bg-slate-600 transition-all mt-6 flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                Avanti <ChevronRight size={20} strokeWidth={3} />
              </button>

              {/* Divisore */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Oppure</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
              </div>

              <div className="flex justify-center mt-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Errore durante la registrazione con Google.')}
                  theme="outline"
                  size="large"
                  width="320"
                  text="signup_with"
                  shape="pill"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1 for Google flow — Just body stats, no username/password */}
        {step === 1 && isGoogleFlow && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-1">Quasi fatto! 🎉</h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-2 font-medium">Accesso con Google verificato</p>
            <p className="text-center text-emerald-500 dark:text-emerald-400 font-bold text-sm mb-6">{username}</p>
            
            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Età" className={inputClass} value={age} onChange={e => setAge(e.target.value)} required />
                <select className={`${inputClass} appearance-none cursor-pointer`} value={gender} onChange={e => setGender(e.target.value)}>
                  <option>Uomo</option>
                  <option>Donna</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Altezza (cm)" className={inputClass} value={height} onChange={e => setHeight(e.target.value)} required />
                <input type="number" placeholder="Peso (kg)" className={inputClass} value={weight} onChange={e => setWeight(e.target.value)} required />
              </div>

              <button 
                onClick={() => { setError(''); setStep(2); }} 
                className="w-full bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-2xl p-4 hover:bg-slate-700 dark:hover:bg-slate-600 transition-all mt-6 flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                Avanti <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Activity & Goal */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex justify-center mb-6 text-emerald-400 dark:text-emerald-500">
              <Target size={48} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-6">Come ti muovi? E qual è il tuo obiettivo?</h2>
            
            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Activity size={16} /> Livello di Attività
                </label>
                <select className={`${inputClass} appearance-none cursor-pointer`} value={activity} onChange={e => setActivity(e.target.value)}>
                  <option>Sedentario</option>
                  <option>Attivo (1-3 gg a settimana)</option>
                  <option>Molto Attivo (4-5 gg a settimana)</option>
                  <option>Atleta (6-7 gg a settimana)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Target size={16} /> Obiettivo
                </label>
                <select className={`${inputClass} appearance-none cursor-pointer`} value={goal} onChange={e => setGoal(e.target.value)}>
                  <option>Mantenimento</option>
                  <option>Dimagrimento (-500 kcal)</option>
                  <option>Massa (+500 kcal)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button onClick={() => setStep(1)} className="px-6 py-4 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  Indietro
                </button>
                <button 
                  onClick={handleCalculateMacros} 
                  disabled={loading}
                  className="flex-1 bg-emerald-400 dark:bg-emerald-500 text-white font-bold rounded-2xl p-4 hover:bg-emerald-500 transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
                >
                  {loading ? 'Calculando...' : <>Pianifica <Sparkles size={20} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Macro Recap */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center mb-4 text-cyan-400 dark:text-cyan-500">
              <Sparkles size={48} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">Ecco il tuo Piano!</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">L'IA ha calcolato i tuoi macro. Puoi modificarli se preferisci.</p>

            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl mb-6 text-sm font-semibold">{error}</div>}

            <div className="bg-gray-50 dark:bg-slate-800 rounded-[2rem] p-6 space-y-4 mb-6 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-300">Calorie (kcal)</span>
                <input type="number" className="w-24 bg-white dark:bg-slate-900 border-none rounded-xl p-2 text-center font-bold text-slate-800 dark:text-slate-100" value={Number.isNaN(macros.Calories) ? '' : macros.Calories} onChange={e => setMacros({...macros, Calories: Number(e.target.value)})} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-300">Proteine (g)</span>
                <input type="number" className="w-24 bg-white dark:bg-slate-900 border-none rounded-xl p-2 text-center font-bold text-emerald-500 dark:text-emerald-400" value={Number.isNaN(macros.Proteins) ? '' : macros.Proteins} onChange={e => setMacros({...macros, Proteins: Number(e.target.value)})} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-300">Carbo (g)</span>
                <input type="number" className="w-24 bg-white dark:bg-slate-900 border-none rounded-xl p-2 text-center font-bold text-cyan-500 dark:text-cyan-400" value={Number.isNaN(macros.Carbs) ? '' : macros.Carbs} onChange={e => setMacros({...macros, Carbs: Number(e.target.value)})} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600 dark:text-slate-300">Grassi (g)</span>
                <input type="number" className="w-24 bg-white dark:bg-slate-900 border-none rounded-xl p-2 text-center font-bold text-rose-400 dark:text-rose-400" value={Number.isNaN(macros.Fats) ? '' : macros.Fats} onChange={e => setMacros({...macros, Fats: Number(e.target.value)})} />
              </div>
            </div>

            <div className="flex gap-3">
               <button onClick={() => setStep(2)} className="px-6 py-4 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50" disabled={loading}>
                  Indietro
               </button>
               <button 
                onClick={handleRegister} 
                disabled={loading}
                className="flex-1 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-2xl p-4 hover:bg-slate-700 transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
               >
                {loading ? 'Preparazione...' : <>Si Parte! <Check size={20} strokeWidth={3} /></>}
               </button>
            </div>
          </div>
        )}

        {!isGoogleFlow && (
          <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Hai già un account? <Link to="/login" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 font-bold">Torna al Login</Link>
          </p>
        )}

        <div className="flex justify-center gap-4 mt-3">
          <Link to="/privacy" className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 uppercase tracking-wider transition-colors">Privacy</Link>
          <Link to="/terms" className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 uppercase tracking-wider transition-colors">Termini</Link>
        </div>

      </div>
    </div>
  );
}
