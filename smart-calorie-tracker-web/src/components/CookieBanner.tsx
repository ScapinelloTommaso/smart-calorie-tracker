import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-[1.75rem] shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 p-5">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-xl flex-shrink-0 mt-0.5">
            <Cookie size={22} className="text-amber-500 dark:text-amber-400" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Utilizziamo i cookie per migliorare la tua esperienza. Continuando, accetti la nostra{' '}
              <Link to="/privacy" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline">Privacy Policy</Link>.
            </p>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-emerald-400 dark:bg-emerald-500 text-white font-bold rounded-xl py-2.5 px-5 hover:bg-emerald-500 transition-colors active:scale-[0.98] text-sm"
              >
                Accetta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
