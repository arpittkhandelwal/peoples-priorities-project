# People's Priorities

**People's Priorities** is an AI-powered civic technology platform built to revolutionize local governance. Designed as a pilot project for the Jaipur constituency, it connects raw citizen feedback with real public data to help Members of Parliament (MPs) prioritize development work where it matters most.

## 🚀 Features

- **Voice-First Citizen Intake**: Multilingual AI intake allows citizens to submit complaints via voice or text in Hindi, English, and Hinglish.
- **Auto-Clustering Engine**: The AI magically groups hundreds of scattered complaints into dense geographic hotspots using semantic analysis.
- **Smart Prioritization**: Hotspots are cross-referenced with public infrastructure data to assign an objective 0-100 priority score for budget allocation.
- **Interactive MP Portal**: A stunning dashboard that visualizes data on a hotspot map and ranked list for instant decision-making.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **AI / LLM**: Groq API (`llama-3.3-70b-versatile`)
- **Styling**: Tailwind CSS & Framer Motion
- **Maps**: React Leaflet

## 🏃‍♂️ Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env.local` with Supabase and Groq API keys.
4. Run the development server: `npm run dev`
5. Navigate to `http://localhost:3000`

---
*Built for the Google Hackathon 2026.*
