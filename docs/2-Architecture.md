# Architettura e Stack Tecnologico

## Backend
* Framework: **.NET 10** (C# 14) - ASP.NET Core Web API.
* Pattern: Clean Architecture semplificata (Controllers, Services, Models, Data).
* ORM: **Entity Framework Core 10**.

## Database
* Motore: **Microsoft SQL Server (T-SQL)**.
* Modelli principali: `User`, `FoodDictionary` (Cache dei cibi), `DailyLog` (Diario utente).

## Integrazioni Esterne
* **Groq API**: Utilizzato tramite `HttpClient` in C# per il parsing veloce dei testi in JSON strutturato.