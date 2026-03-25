# Smart Calorie Tracker - UI/UX Guidelines

## 1. Design Philosophy
L'interfaccia deve essere **Mobile-First**, estremamente pulita, accattivante e "giocosa". 
Prende forte ispirazione dall'estetica "Soft & Playful" (vedi immagini in `docs/design-references`).

## 2. Color Palette (Tailwind reference)
- **Background App:** Grigio chiarissimo/Off-white (es. `bg-gray-50` o `#F9FAFB`).
- **Card Backgrounds:** Bianco puro (`bg-white`) con ombre morbide (`shadow-sm` o `shadow-md`), oppure sfondi pastello leggerissimi.
- **Colori Accento (Pastello):**
  - Verde pastello (es. `#E2F0D9` o `emerald-100/200`) per badge o success.
  - Giallo pastello (es. `#FFF2CC` o `yellow-100`) per elementi di highlight.
  - Rosa pastello/Rosso (es. `#FCE4D6` o `rose-200`) per grassi o warning.
- **Testo:** Grigio scuro/Nero morbido (es. `text-slate-800`) per contrasto elevato e leggibilità.

## 3. Typography
- Font pulito e rotondo (es. **Poppins** o **Inter**, importati da Google Fonts).
- Titoli grandi e in grassetto per sezioni come "My Food Diary" o "Oggi".

## 4. UI Components & Shapes
- **Bordi:** Estremamente arrotondati (es. `rounded-2xl` o `rounded-3xl` in Tailwind).
- **Grafici:** - *Donut Chart* centrale per le calorie (Mangiati vs Rimanenti).
  - *Progress Bars* orizzontali sottili con bordi arrotondati per i Macro (Carboidrati, Proteine, Grassi).
- **Icone:** Grandi, colorate, in stile flat/illustrato (stile "FoodDiary" reference).
- **Bottoni:** Arrotondati (Pill shape), con colori primari o pastello e hover effects fluidi.

## 5. Layout (Mobile-First)
- Layout a colonna singola che si estende fluidamente su desktop in una griglia.
- Spaziature generose (`padding` e `gap` ampi) per far "respirare" l'interfaccia.