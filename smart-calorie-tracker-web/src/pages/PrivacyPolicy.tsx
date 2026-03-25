import { Link } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 font-bold text-sm mb-8 transition-colors">
          <ChevronLeft size={18} /> Torna indietro
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-2xl">
            <Shield size={28} className="text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Privacy Policy</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">1. Titolare del Trattamento</h2>
            <p>Il titolare del trattamento dei dati è Smart Calorie Tracker. Per qualsiasi richiesta relativa alla privacy, contattaci all'indirizzo email indicato nella sezione contatti dell'applicazione.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">2. Dati Raccolti</h2>
            <p>Raccogliamo le seguenti categorie di dati personali:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Dati di registrazione:</strong> username e password (criptata tramite BCrypt).</li>
              <li><strong>Dati nutrizionali:</strong> pasti inseriti, obiettivi calorici e macro personalizzati.</li>
              <li><strong>Dati tecnici:</strong> cookie tecnici necessari al funzionamento dell'applicazione.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">3. Finalità del Trattamento</h2>
            <p>I dati sono trattati esclusivamente per fornire il servizio di tracciamento calorico e nutrizionale, migliorare l'esperienza utente e garantire la sicurezza dell'applicazione.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">4. Conservazione dei Dati</h2>
            <p>I dati personali sono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti. L'utente può richiedere la cancellazione del proprio account e di tutti i dati associati in qualsiasi momento.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">5. Diritti dell'Interessato</h2>
            <p>Ai sensi del GDPR, l'utente ha diritto di accesso, rettifica, cancellazione, limitazione del trattamento e portabilità dei propri dati personali.</p>
          </section>

          <p className="text-sm text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
            Ultimo aggiornamento: Marzo 2026
          </p>
        </div>
      </div>
    </div>
  );
}
