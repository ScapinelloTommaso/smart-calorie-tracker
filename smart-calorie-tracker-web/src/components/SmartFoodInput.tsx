import { useMemo } from 'react';

export interface KnownFood {
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

interface SmartFoodInputProps {
  value: string;
  onChange: (val: string) => void;
  knownFoods: string[];
  knownFoodsDetails: KnownFood[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function SmartFoodInput({ value, onChange, knownFoods, knownFoodsDetails, placeholder, disabled, autoFocus }: SmartFoodInputProps) {

  // Detect which known foods are currently typed in the input
  const detectedFoods = useMemo(() => {
    if (!value || knownFoodsDetails.length === 0) return [];

    const inputLower = value.toLowerCase();
    const found: KnownFood[] = [];

    for (const food of knownFoodsDetails) {
      if (inputLower.includes(food.name.toLowerCase())) {
        found.push(food);
      }
    }

    return found;
  }, [value, knownFoodsDetails]);

  // Build highlighted HTML for the background layer
  const highlightedHtml = useMemo(() => {
    if (!value || knownFoods.length === 0) return value || '';

    const knownSet = new Set(knownFoods.map(f => f.toLowerCase()));
    const parts = value.split(/(\s+)/);

    return parts.map((part) => {
      if (/^\s+$/.test(part)) return part;

      const cleaned = part.replace(/[.,;:!?'"()]/g, '').toLowerCase();
      const isKnown = cleaned.length > 2 && knownSet.has(cleaned);

      if (isKnown) {
        return `<span class="text-blue-500 font-bold bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 rounded px-0.5">${part}</span>`;
      }
      return part;
    }).join('');
  }, [value, knownFoods]);

  return (
    <div className="w-full">
      {/* Input area with overlay */}
      <div className="relative w-full">
        {/* Background highlight layer */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 text-slate-800 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-wrap break-words overflow-hidden"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightedHtml || `<span class="text-slate-400 dark:text-slate-500">${placeholder || ''}</span>` }}
        />
        {/* Transparent textarea */}
        <textarea
          className="relative w-full bg-transparent text-transparent caret-slate-800 dark:caret-slate-100 outline-none p-4 font-medium leading-relaxed resize-none h-36 selection:bg-blue-200 dark:selection:bg-blue-800"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder=""
          disabled={disabled}
          autoFocus={autoFocus}
          style={{ WebkitTextFillColor: 'transparent' }}
        />
      </div>

      {/* Detected food chips */}
      {detectedFoods.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 pb-3 -mt-1">
          {detectedFoods.map((food) => (
            <div 
              key={food.name}
              className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-1.5 animate-in fade-in zoom-in-95 duration-200"
            >
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 capitalize">{food.name}</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {food.calories} kcal
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                P:{food.proteins}g C:{food.carbs}g G:{food.fats}g
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
