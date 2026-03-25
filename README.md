# 🍏 Smart Calorie Tracker

## Overview
A powerful, AI-powered nutritional diary designed to simplify calorie and macronutrient tracking. By leveraging Natural Language Processing, Smart Calorie Tracker makes logging your meals as easy as describing them.

## Key Features
- **AI Meal Logging**: Seamlessly log meals using natural language, powered by the Groq LLM.
- **Dynamic Macro Calculation**: Automatically calculates proteins, fats, carbs, and total calories.
- **Real-time Dashboard**: Instantly track and monitor your daily nutritional progress.
- **Barcode Scanning**: Quickly scan physical food products utilizing the Open Food Facts API.
- **Responsive UI/UX**: Clean, modern interface fully optimized for mobile and desktop, complete with Dark Mode support.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- TypeScript

### Backend
- C# .NET 8 Web API
- Entity Framework Core

### Database
- Azure SQL

### AI Integration
- Groq API (Llama 3 / Mixtral)

## Architecture & Patterns
This project features a clean, monorepo-like structure ensuring scalability and maintainability.
- **RESTful APIs**: Standardized communication between frontend and backend.
- **Context API**: Efficient state management on the client side.
- **JWT Authentication**: Secure and stateless user authentication.
- **Repository Pattern**: Encapsulates data access logic for clean, testable architecture.
