-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Submissions Table
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  raw_text TEXT,
  raw_language TEXT,
  translated_text TEXT,
  audio_url TEXT,
  photo_url TEXT,
  photo_tags JSONB,
  location JSONB, -- {lat: number, lng: number}
  location_text TEXT,
  category TEXT,
  urgency_signal TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new'
);

-- 2. Clusters Table
CREATE TABLE clusters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  theme TEXT,
  category TEXT,
  submission_ids UUID[],
  submission_count INTEGER,
  centroid_location JSONB, -- {lat: number, lng: number}
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rankings Table
CREATE TABLE rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
  rank INTEGER,
  priority_score NUMERIC,
  justification TEXT,
  supporting_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for citizen intake app (no auth required)
CREATE POLICY "Allow public inserts on submissions" 
ON submissions 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow public reads on submissions (temporarily useful for demo/dashboard without auth setup complexity, 
-- or restrict to authenticated users later)
CREATE POLICY "Allow public reads on submissions" 
ON submissions 
FOR SELECT 
TO public 
USING (true);

-- Allow public updates on submissions (used by the AI pipeline serverless functions)
CREATE POLICY "Allow public updates on submissions" 
ON submissions 
FOR UPDATE 
TO public 
USING (true);

-- Allow public reads on clusters
CREATE POLICY "Allow public reads on clusters" 
ON clusters 
FOR SELECT 
TO public 
USING (true);

-- Allow public inserts/updates on clusters (used by the AI pipeline)
CREATE POLICY "Allow public inserts on clusters" 
ON clusters 
FOR INSERT 
TO public 
WITH CHECK (true);
CREATE POLICY "Allow public updates on clusters" 
ON clusters 
FOR UPDATE 
TO public 
USING (true);

-- Allow public reads on rankings
CREATE POLICY "Allow public reads on rankings" 
ON rankings 
FOR SELECT 
TO public 
USING (true);

-- Allow public inserts/updates on rankings (used by the AI pipeline)
CREATE POLICY "Allow public inserts on rankings" 
ON rankings 
FOR INSERT 
TO public 
WITH CHECK (true);
CREATE POLICY "Allow public updates on rankings" 
ON rankings 
FOR UPDATE 
TO public 
USING (true);

-- Note: In a production app, the AI pipeline and dashboard reads/writes 
-- should be protected by Supabase Auth and Service Role keys. For this hackathon demo, 
-- we are keeping policies open for ease of development.

-- 5. Storage Buckets
-- Create a storage bucket for media uploads (photos/audio)
insert into storage.buckets (id, name, public) values ('media', 'media', true);

CREATE POLICY "Allow public uploads to media bucket" 
ON storage.objects 
FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public reads on media bucket" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'media');
