import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Oggi": "Today",
      "Riepilogo Giornata": "Daily Summary",
      "Carboidrati": "Carbs",
      "Proteine": "Proteins",
      "Grassi": "Fats",
      "Colazione": "Breakfast",
      "Pranzo": "Lunch",
      "Cena": "Dinner",
      "Spuntini": "Snacks",
      "Profilo": "Profile",
      "Logout": "Logout",
      "Lingua": "Language",
      "I miei pasti": "My Meals",
      "Calorie Giornaliere": "Daily Calories",
      "I miei Obiettivi": "My Goals",
      "Gestisci il piano": "Manage your plan",
      "Salva Modifiche": "Save Changes",
      "Modifica Pasto": "Edit Meal",
      "Aggiungi Pasto": "Add Meal"
    }
  },
  it: {
    translation: {
      "Oggi": "Oggi",
      "Riepilogo Giornata": "Riepilogo Giornata",
      "Carboidrati": "Carboidrati",
      "Proteine": "Proteine",
      "Grassi": "Grassi",
      "Colazione": "Colazione",
      "Pranzo": "Pranzo",
      "Cena": "Cena",
      "Spuntini": "Spuntini",
      "Profilo": "Profilo",
      "Logout": "Logout",
      "Lingua": "Lingua",
      "I miei pasti": "I miei pasti",
      "Calorie Giornaliere": "Calorie Giornaliere (kcal)",
      "I miei Obiettivi": "I miei Obiettivi",
      "Gestisci il piano": "Gestisci il tuo piano",
      "Salva Modifiche": "Salva Modifiche",
      "Modifica Pasto": "Modifica Pasto",
      "Aggiungi Pasto": "Aggiungi Pasto"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "it",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
