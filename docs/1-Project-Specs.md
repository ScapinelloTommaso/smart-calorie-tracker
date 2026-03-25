# Smart Calorie Tracker - Specifiche di Progetto

## Obiettivo
Creare un'app MVP (Minimum Viable Product) per il tracciamento rapido delle calorie tramite input in linguaggio naturale. L'utente scrive cosa ha mangiato, l'app calcola calorie e macro, e aggiorna il diario giornaliero.

## Core Features
1. **Natural Language Input:** L'utente inserisce testo (es. "150g pasta al ragù").
2. **AI Parsing:** Integrazione API Groq (LLM) per estrarre cibo, grammi, calorie e macronutrienti (Proteine, Carboidrati, Grassi).
3. **Smart Cache (Dizionario):** I cibi processati dall'IA vengono salvati in un dizionario locale nel DB. Prima di chiamare Groq, il sistema controlla se il cibo esiste già nel DB per azzerare la latenza e i costi API.
4. **Daily Dashboard:** Visualizzazione delle calorie consumate vs l'obiettivo giornaliero dell'utente.