import { Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 font-bold text-sm mb-8 transition-colors">
          <ChevronLeft size={18} /> Torna indietro
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-cyan-100 dark:bg-cyan-900/40 p-3 rounded-2xl">
            <FileText size={28} className="text-cyan-500 dark:text-cyan-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Termini di Servizio</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">1. Accettazione dei Termini</h2>
            <p>Utilizzando Smart Calorie Tracker, l'utente accetta integralmente i presenti Termini di Servizio. Se non si accettano i termini, è necessario interrompere l'utilizzo dell'applicazione.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">2. Descrizione del Servizio</h2>
            <p>Smart Calorie Tracker è un'applicazione di supporto al monitoraggio nutrizionale che utilizza l'Intelligenza Artificiale per analizzare i pasti inseriti dall'utente. Il servizio non sostituisce il parere di un medico o di un nutrizionista professionista.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">3. Responsabilità dell'Utente</h2>
            <p>L'utente è responsabile della correttezza dei dati inseriti e dell'utilizzo appropriato del servizio. L'utente si impegna a non utilizzare l'applicazione per scopi illeciti.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">4. Limitazione di Responsabilità</h2>
            <p>Smart Calorie Tracker non garantisce l'accuratezza assoluta dei valori nutrizionali calcolati dall'IA. I dati forniti sono da considerarsi stime indicative. Il fornitore del servizio non è responsabile per eventuali danni derivanti dall'uso improprio delle informazioni.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">5. Modifiche ai Termini</h2>
            <p>Ci riserviamo il diritto di modificare i presenti Termini di Servizio in qualsiasi momento. Le modifiche saranno effettive dalla data di pubblicazione sulla piattaforma.</p>
          </section>

          <p className="text-sm text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
            Ultimo aggiornamento: Marzo 2026
          </p>
        </div>
      </div>
    </div>
  );
}
