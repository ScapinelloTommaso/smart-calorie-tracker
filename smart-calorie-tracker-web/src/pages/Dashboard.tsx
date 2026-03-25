import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Plus, Sparkles, Loader2, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CalendarDays, Pencil, Trash2, Wand2, Copy, Check as CheckIcon } from "lucide-react";
import { BreakfastIcon, LunchIcon, DinnerIcon, SnackIcon } from "../components/MealIcons";
import SmartFoodInput from "../components/SmartFoodInput";
import type { KnownFood } from "../components/SmartFoodInput";
import api from "../services/api";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../context/AuthContext";

interface Summary {
  totaleCalorieOggi: number;
  totaleProteineOggi: number;
  totaleCarboidratiOggi: number;
  totaleGrassiOggi: number;
  targetCalorie: number;
  targetProteine: number;
  targetCarboidrati: number;
  targetGrassi: number;
}

interface Log {
  id: string;
  name: string;
  calories: number;
  grams: string;
  icon: any;
  color: string;
  mealType: string;
}

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [summary, setSummary] = useState<Summary>({
    totaleCalorieOggi: 0,
    totaleProteineOggi: 0,
    totaleCarboidratiOggi: 0,
    totaleGrassiOggi: 0,
    targetCalorie: user?.dailyCalorieGoal || 2000,
    targetProteine: user?.dailyProteinGoal || 150,
    targetCarboidrati: user?.dailyCarbsGoal || 200,
    targetGrassi: user?.dailyFatsGoal || 60,
  });
  
  const [logs, setLogs] = useState<Log[]>([]);
  
  // Modale Add Pasto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealInput, setMealInput] = useState("");
  const [mealType, setMealType] = useState("Colazione");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // AI Suggestion
  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionCopied, setSuggestionCopied] = useState(false);

  // Known Foods
  const [knownFoods, setKnownFoods] = useState<string[]>([]);
  const [knownFoodsDetails, setKnownFoodsDetails] = useState<KnownFood[]>([]);

  // Modale Calendario
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthData, setMonthData] = useState<Record<string, { total: number; goal: number }>>({});

  // Targets come from backend snapshot (not just AuthContext)
  const targets = { 
    calories: summary.targetCalorie, 
    proteins: summary.targetProteine, 
    carbs: summary.targetCarboidrati, 
    fats: summary.targetGrassi 
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  useEffect(() => {
    fetchKnownFoods();
  }, []);

  const fetchKnownFoods = async () => {
    try {
      const { data } = await api.get('/diary/known-foods');
      setKnownFoods(data);
    } catch { /* silent */ }
    try {
      const { data } = await api.get('/diary/known-foods-details');
      setKnownFoodsDetails(data.map((f: any) => ({
        name: f.name,
        calories: f.calories,
        proteins: f.proteins,
        carbs: f.carbs,
        fats: f.fats
      })));
    } catch { /* silent */ }
  };

  const handleSuggestMeal = async () => {
    setIsSuggesting(true);
    setSuggestion('');
    setSuggestionCopied(false);
    try {
      const { data } = await api.get('/diary/suggest-meal');
      setSuggestion(data.suggestion);
    } catch {
      setSuggestion('Errore nel generare il suggerimento. Riprova!');
    } finally {
      setIsSuggesting(false);
    }
  };

  const copySuggestionToInput = () => {
    setMealInput(suggestion);
    setSuggestionCopied(true);
    openModal();
    setTimeout(() => setSuggestionCopied(false), 2000);
  };

  const fetchSummary = async () => {
    try {
      const localIso = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      const { data } = await api.get('/diary/summary', { params: { date: localIso } });
      setSummary({
        totaleCalorieOggi: data.totaleCalorieOggi || 0,
        totaleProteineOggi: data.totaleProteineOggi || 0,
        totaleCarboidratiOggi: data.totaleCarboidratiOggi || 0,
        totaleGrassiOggi: data.totaleGrassiOggi || 0,
        targetCalorie: data.targetCalorie || user?.dailyCalorieGoal || 2000,
        targetProteine: data.targetProteine || user?.dailyProteinGoal || 150,
        targetCarboidrati: data.targetCarboidrati || user?.dailyCarbsGoal || 200,
        targetGrassi: data.targetGrassi || user?.dailyFatsGoal || 60,
      });

      if (data.logs) {
        const mappedLogs = data.logs.map((l: any) => ({
          id: l.id.toString(),
          name: l.name,
          calories: l.calories,
          grams: l.grams,
          icon: l.mealType === 'Colazione' ? BreakfastIcon : l.mealType === 'Pranzo' ? LunchIcon : l.mealType === 'Cena' ? DinnerIcon : SnackIcon,
          color: "text-slate-800",
          mealType: l.mealType
        }));
        setLogs(mappedLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Impossibile caricare il sommario della Dashboard", err);
    }
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    const maxDate = new Date();
    maxDate.setHours(23,59,59,999);
    if (next <= maxDate) {
      setSelectedDate(next);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const formattedDate = isToday ? 'Oggi' : new Intl.DateTimeFormat('it-IT', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  }).format(selectedDate);

  const openModal = () => {
    const hour = new Date().getHours();
    let defaultType = 'Spuntino';
    if (hour >= 6 && hour <= 11) defaultType = 'Colazione';
    else if (hour >= 12 && hour <= 15) defaultType = 'Pranzo';
    else if (hour >= 19 && hour <= 22) defaultType = 'Cena';
    setMealType(defaultType);
    setMealInput('');
    setEditingLogId(null);
    setIsModalOpen(true);
  };

  const openModalForMeal = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealType(type);
    setMealInput('');
    setEditingLogId(null);
    setIsModalOpen(true);
  };

  const handleEditMeal = (log: Log, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealType(log.mealType);
    setMealInput(`${log.grams} ${log.name}`);
    setEditingLogId(log.id);
    setIsModalOpen(true);
  };

  const handleDeleteMeal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Sei sicuro di voler eliminare questo pasto dal diario?")) return;
    
    try {
      await api.delete(`/diary/${id}`);
      await fetchSummary();
    } catch (err) {
      console.error(err);
      alert("Errore durante l'eliminazione!");
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealInput || !mealInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const localIso = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const payload = { 
        Input: mealInput, 
        MealType: mealType,
        Date: localIso
      };
      
      if (editingLogId) {
        await api.put(`/diary/${editingLogId}`, payload);
      } else {
        await api.post('/diary/add', payload);
        // Re-fetch known foods so SmartFoodInput highlighting is immediately current
        fetchKnownFoods();
      }
      
      await fetchSummary();
      
      setIsModalOpen(false);
      setMealInput('');
      setEditingLogId(null);
      setExpandedMeal(mealType);
    } catch (err) {
      console.error("Errore Operazione Meal", err);
      alert("Errore nell'operazione. Verifica la tua connessione API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchMonthData = async (date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const { data } = await api.get(`/diary/month?year=${year}&month=${month}`);
      
      const mapped: Record<string, { total: number; goal: number }> = {};
      data.forEach((d: any) => {
        mapped[d.date] = { total: d.totalCalories, goal: d.goalCalories };
      });
      setMonthData(mapped);
    } catch (err) {
      console.error("Error fetching month data", err);
    }
  };

  const openCalendar = () => {
    setCalendarMonth(selectedDate);
    fetchMonthData(selectedDate);
    setIsCalendarOpen(true);
  };

  const prevMonth = () => {
    const prev = new Date(calendarMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCalendarMonth(prev);
    fetchMonthData(prev);
  };

  const nextMonth = () => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + 1);
    const today = new Date();
    if (next.getFullYear() <= today.getFullYear() && next.getMonth() <= today.getMonth()) {
        setCalendarMonth(next);
        fetchMonthData(next);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };
  
  const daysInMonth = getDaysInMonth(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const firstDay = getFirstDayOfMonth(calendarMonth.getFullYear(), calendarMonth.getMonth());
  
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const blockIndex = i - firstDay + 1;
    if (blockIndex > 0 && blockIndex <= daysInMonth) {
      return blockIndex;
    }
    return null;
  });

  const getDayColorClass = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = monthData[dateStr];
    
    if (!dayData || dayData.total === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700';
    
    const ratio = dayData.total / dayData.goal;
    if (ratio >= 0.90 && ratio <= 1.10) return 'bg-emerald-400 dark:bg-emerald-500 text-white shadow-md shadow-emerald-400/30 dark:shadow-emerald-500/20';
    if ((ratio >= 0.75 && ratio < 0.90) || (ratio > 1.10 && ratio <= 1.25)) return 'bg-amber-400 dark:bg-amber-500 text-white shadow-md shadow-amber-400/30 dark:shadow-amber-500/20';
    return 'bg-rose-400 dark:bg-rose-500 text-white shadow-md shadow-rose-400/30 dark:shadow-rose-500/20';
  };

  const handleSelectCalendarDay = (day: number) => {
    const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    if (newDate > new Date()) return;
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
  };

  const macros = [
    { label: "Carboidrati", current: summary.totaleCarboidratiOggi, target: targets.carbs, color: "bg-cyan-400" },
    { label: "Proteine", current: summary.totaleProteineOggi, target: targets.proteins, color: "bg-emerald-400" },
    { label: "Grassi", current: summary.totaleGrassiOggi, target: targets.fats, color: "bg-rose-400" },
  ];

  const chartData = [
    { name: "Consumed", value: summary.totaleCalorieOggi },
    { name: "Remaining", value: Math.max(0, targets.calories - summary.totaleCalorieOggi) },
  ];
  
  const COLORS = ["#34d399", isDarkMode ? "#334155" : "#f1f5f9"]; 
  
  const mealCategories = [
    { type: "Colazione", title: "Colazione", icon: BreakfastIcon, color: "" },
    { type: "Pranzo", title: "Pranzo", icon: LunchIcon, color: "" },
    { type: "Spuntino", title: "Spuntini", icon: SnackIcon, color: "" },
    { type: "Cena", title: "Cena", icon: DinnerIcon, color: "" },
  ];

  const toggleAccordion = (type: string) => {
    setExpandedMeal(expandedMeal === type ? null : type);
  };

  return (
    <div className="font-sans text-slate-800 dark:text-slate-100">
      <header className="px-6 pt-10 pb-4">
        <div className="grid grid-cols-3 items-center w-full mb-6 relative min-h-[60px]">
          <div className="flex justify-start">
            <button onClick={handlePrevDay} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 text-slate-400 dark:text-slate-300">
              <ChevronLeft size={24} />
            </button>
          </div>
          
          <div 
            className="flex justify-center items-center gap-2 cursor-pointer active:scale-95 transition-transform" 
            onClick={openCalendar}
          >
             <span className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 capitalize">{formattedDate}</span>
             <CalendarDays size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleNextDay} 
              disabled={isToday}
              className={`p-2 rounded-full transition-colors active:scale-95 ${isToday ? 'opacity-0 cursor-default' : 'bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300'}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 relative">
        {/* Riepilogo Calorie */}
        <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 mb-8 border border-slate-50 dark:border-slate-700/50 flex flex-col justify-between transition-colors duration-300">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 text-center">Riepilogo Giornata</h2>
          
          <div className="relative w-full mx-auto block max-w-[280px] my-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart width={280} height={250}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={110}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={12}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-[2.75rem] font-extrabold text-slate-800 dark:text-slate-100 leading-none tracking-tight">{summary.totaleCalorieOggi}</span>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 block">/ {targets.calories} kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100/50 dark:border-slate-700/50">
            {macros.map((macro, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{macro.label}</span>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full ${macro.color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{Math.round(macro.current)}<span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 ml-0.5">/{macro.target}g</span></span>
              </div>
            ))}
          </div>

          {/* AI Suggestion Button */}
          <button
            onClick={handleSuggestMeal}
            disabled={isSuggesting}
            className="w-full mt-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 dark:from-violet-600 dark:to-fuchsia-600 text-white font-bold rounded-2xl p-4 flex justify-center items-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait shadow-lg shadow-violet-500/20 dark:shadow-violet-600/20"
          >
            {isSuggesting ? (
              <><Loader2 size={20} className="animate-spin" /> Sto pensando...</>
            ) : (
              <><Wand2 size={20} strokeWidth={2.5} /> Consigliami un pasto</>
            )}
          </button>

          {/* Suggestion Card */}
          {suggestion && (
            <div className="mt-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-800/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start gap-3">
                <div className="bg-violet-100 dark:bg-violet-800/40 p-2 rounded-xl flex-shrink-0 mt-0.5">
                  <Sparkles size={18} className="text-violet-500 dark:text-violet-400" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">{suggestion}</p>
              </div>
              <button
                onClick={copySuggestionToInput}
                className="mt-3 w-full bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 font-bold rounded-xl p-3 flex justify-center items-center gap-2 hover:bg-violet-100 dark:hover:bg-slate-700 transition-colors active:scale-[0.98] border border-violet-200 dark:border-slate-700 text-sm"
              >
                {suggestionCopied ? <><CheckIcon size={16} /> Copiato!</> : <><Copy size={16} /> Usa come pasto</>}
              </button>
            </div>
          )}
        </section>

        {/* I miei Pasti */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">I miei pasti</h2>
          </div>
          
          <div className="space-y-4">
            {mealCategories.map((category) => {
              const Icon = category.icon;
              const categoryLogs = logs.filter(l => l.mealType === category.type);
              const groupCalories = categoryLogs.reduce((acc, l) => acc + l.calories, 0);
              const isExpanded = expandedMeal === category.type;

              return (
                <div key={category.type} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none border border-slate-50 dark:border-slate-700/50 overflow-hidden transition-all duration-300">
                  <div 
                    onClick={() => toggleAccordion(category.type)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex-shrink-0 drop-shadow-sm">
                        <Icon className="w-full h-full" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-700 dark:text-slate-100 text-lg block">{category.title}</span>
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-0.5 block">{groupCalories} kcal</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => openModalForMeal(category.type, e)}
                        className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 dark:text-cyan-400 hover:bg-cyan-600 dark:hover:bg-cyan-900/40 p-3 rounded-2xl transition-colors active:scale-95"
                      >
                        <Plus size={22} strokeWidth={3} />
                      </button>
                      <div className="text-slate-300 dark:text-slate-600 ml-1">
                         {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 animate-in slide-in-from-top-4 fade-in duration-200">
                      {categoryLogs.length === 0 ? (
                        <p className="text-center text-sm font-medium text-slate-400 dark:text-slate-500 py-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                          Nessun pasto registrato
                        </p>
                      ) : (
                        <div className="space-y-3 mt-2">
                          {categoryLogs.map(log => (
                            <div key={log.id} className="flex justify-between items-center px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.25rem] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                              <div className="flex-1 overflow-hidden pr-2">
                                <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{log.name}</p>
                                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{log.grams}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm whitespace-nowrap">{log.calories} kcal</span>
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => handleEditMeal(log, e)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                                    <Pencil size={18} strokeWidth={2.5} />
                                  </button>
                                  <button onClick={(e) => handleDeleteMeal(log.id, e)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                                    <Trash2 size={18} strokeWidth={2.5} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FAB */}
      <button 
        onClick={openModal}
        className="fixed bottom-28 right-6 bg-emerald-400 text-white p-4 justify-center items-center flex rounded-[1.25rem] shadow-[0_8px_16px_rgba(52,211,153,0.4)] hover:bg-emerald-500 hover:scale-105 hover:-translate-y-1 transition-all active:scale-95 z-40 cursor-pointer"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* IA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200 relative overflow-hidden border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
                <Sparkles size={26} className="text-cyan-400 fill-cyan-400" /> {editingLogId ? 'Modifica Pasto' : 'Aggiungi Pasto'}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => !isAnalyzing && setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 bg-slate-50 dark:bg-slate-900 rounded-full">
                  <X size={22} strokeWidth={3} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddMeal} className="relative z-10">
              <div className="mb-4">
                 <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-4 text-slate-800 dark:text-slate-100 font-bold outline-none hover:bg-slate-100 dark:hover:bg-slate-950 cursor-pointer appearance-none transition-all"
                    value={mealType}
                    onChange={e => setMealType(e.target.value)}
                    disabled={isAnalyzing}
                 >
                    <option value="Colazione">🌅 Colazione</option>
                    <option value="Pranzo">🥗 Pranzo</option>
                    <option value="Spuntino">🍎 Spuntini</option>
                    <option value="Cena">🌙 Cena</option>
                 </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl mb-6 overflow-hidden">
                <SmartFoodInput
                  value={mealInput}
                  onChange={setMealInput}
                  knownFoods={knownFoods}
                  knownFoodsDetails={knownFoodsDetails}
                  placeholder="Es. Ho mangiato 150g di pasta al pomodoro e una mela..."
                  disabled={isAnalyzing}
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isAnalyzing || !mealInput.trim()}
                className="w-full bg-cyan-400 text-white font-extrabold rounded-[1.25rem] p-4 hover:bg-cyan-500 transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-lg shadow-cyan-400/30"
              >
                {isAnalyzing ? (
                  <><Loader2 size={22} className="animate-spin" /></>
                ) : (
                  'Salva e Analizza'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {calendarMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 bg-slate-50 dark:bg-slate-900 rounded-full active:scale-95">
                  <ChevronLeft size={22} strokeWidth={3} />
                </button>
                <div className="w-[1px] bg-slate-100 dark:bg-slate-800 mx-1 border-none shadow-none" ></div>
                <button 
                  onClick={nextMonth} 
                  disabled={calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() === new Date().getMonth()}
                  className={`p-1.5 rounded-full transition-colors active:scale-95 ${calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() === new Date().getMonth() ? 'text-slate-300 dark:text-slate-600 bg-transparent opacity-50 cursor-not-allowed' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-900'}`}
                >
                  <ChevronRight size={22} strokeWidth={3} />
                </button>
                <div className="w-[1px] bg-transparent mx-2 border-none shadow-none" ></div>
                <button onClick={() => setIsCalendarOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-full active:scale-95">
                  <X size={22} strokeWidth={3} className="text-rose-500 dark:text-rose-400" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-center font-extrabold text-[10px] text-slate-400 dark:text-slate-500">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="h-10 w-10"></div>;
                const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const isFuture = dateObj > new Date();
                const colorClass = isFuture ? 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50' : getDayColorClass(day);

                return (
                  <button 
                    key={i} 
                    disabled={isFuture}
                    onClick={() => handleSelectCalendarDay(day)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all active:scale-90 ${colorClass}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
