# People's Priorities

People's Priorities is an AI-powered civic technology platform built to modernize and streamline local governance. Designed as an initial pilot project for the Jaipur constituency, it connects unstructured citizen feedback with quantitative public data to assist Members of Parliament (MPs) in prioritizing infrastructure development and budget allocation.

## Overview

Local government offices often receive hundreds of unstructured, multilingual complaints across various channels. Processing this data manually is inefficient and prone to subjective bias. People's Priorities solves this by introducing a fully automated AI pipeline that ingests, translates, clusters, and objectively ranks citizen feedback against verified public data (e.g., UDISE+ and Census metrics).

## Core System Capabilities

- Multilingual Intake Processing: Automatically translates and normalizes submissions received in Hindi, English, or mixed regional dialects using advanced Large Language Models.
- Geographic Auto-Clustering: Uses semantic similarity and geographic proximity to group scattered individual complaints into high-density regional hotspots.
- Objective Prioritization Engine: Cross-references localized hotspots with public infrastructure datasets to assign a deterministic 0-100 priority score, eliminating subjective bias in budget allocation.
- MP Dashboard: Provides a secure, real-time geographic interface for government officials to review ranked priorities and interact with the underlying constituent data.

## Technical Architecture

The application is built on a modern, edge-ready technology stack designed for high throughput and rapid iteration.

- Frontend Architecture: Next.js 14 (App Router) with React Server Components.
- Styling and Animation: Tailwind CSS with Framer Motion for hardware-accelerated user interfaces.
- Database and Authentication: Supabase (PostgreSQL) with Row Level Security (RLS).
- AI Inference: Google Gemini API utilizing the Gemini 1.5 Flash model for sub-second, high-throughput NLP tasks.
- Geospatial Visualization: React Leaflet integrated with OpenStreetMap tiles.

## Installation and Setup

### Prerequisites

Ensure you have Node.js (v18+) and npm installed on your local development environment. You will also require active accounts and API keys for Supabase and Groq.

### Local Development

1. Clone the repository and navigate into the project directory.
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Duplicate the `.env.example` file and rename it to `.env.local`. Populate the required environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Initialize the Supabase database schema by executing the SQL commands found in `supabase/schema.sql` within your Supabase project's SQL Editor.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Access the application locally at `http://localhost:3000`.

## AI Pipeline Reference

The backend operates on a three-stage AI processing pipeline triggered asynchronously upon data ingestion:

1. Normalization Stage (`/api/pipeline/normalize`): Cleans the raw citizen input, translates it to English, and categorizes the underlying infrastructure issue (e.g., Water, Roads, Education).
2. Clustering Stage (`/api/pipeline/cluster`): Evaluates normalized records to determine if they belong to an existing hotspot or warrant the creation of a new cluster based on geospatial bounds.
3. Ranking Stage (`/api/pipeline/rank`): Analyzes the aggregate severity of a cluster against external public data (e.g., population density, existing school facilities) to compute a final priority score.

## Security and Compliance

- Environment Variables: Sensitive API keys must remain strictly server-side.
- Row Level Security: Ensure Supabase RLS policies are strictly enforced before deploying to production to prevent unauthorized access to citizen data.

---

Developed for the Google Hackathon 2026.
