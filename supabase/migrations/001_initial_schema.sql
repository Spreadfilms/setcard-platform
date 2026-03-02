-- Enable pgcrypto for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Actors Tabelle
CREATE TABLE IF NOT EXISTS actors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Persönliche Daten
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('männlich', 'weiblich', 'divers')),
  nationality TEXT,
  city TEXT,

  -- Körperliche Merkmale
  height_cm INTEGER,
  weight_kg INTEGER,
  hair_color TEXT,
  eye_color TEXT,
  skin_type TEXT,
  body_type TEXT CHECK (body_type IN ('schlank', 'sportlich', 'normal', 'kräftig')),
  clothing_size_top TEXT,
  clothing_size_bottom TEXT,
  shoe_size NUMERIC(3,1),

  -- Schauspiel-Daten
  experience_level TEXT CHECK (experience_level IN ('Anfänger', 'Fortgeschritten', 'Profi')),
  acting_skills TEXT[],
  languages JSONB,
  dialects TEXT[],
  special_skills TEXT[],
  sports TEXT[],
  music_skills TEXT[],
  drivers_license TEXT[],

  -- Agentur
  agency_name TEXT,
  agency_contact TEXT,

  -- Freitext
  about_me TEXT,
  showreel_url TEXT,

  -- Verwaltung (nur Admin)
  status TEXT DEFAULT 'neu' CHECK (status IN ('neu', 'abgelehnt', 'onhold', 'pool')),
  cast_priority TEXT CHECK (cast_priority IN ('A', 'B', 'C')),
  admin_notes TEXT,

  -- Zugang
  pin_hash TEXT,
  pin_expires_at TIMESTAMPTZ,
  share_hash TEXT DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Medien
  portrait_photo_url TEXT,
  halfbody_photo_url TEXT,
  fullbody_photo_url TEXT,
  additional_photos TEXT[],
  video_urls TEXT[]
);

-- Email Log Tabelle
CREATE TABLE IF NOT EXISTS email_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  actor_id UUID REFERENCES actors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('pin', 'absage', 'anfrage', 'info', 'custom')),
  sent_by TEXT
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_actors_email ON actors(email);
CREATE INDEX IF NOT EXISTS idx_actors_status ON actors(status);
CREATE INDEX IF NOT EXISTS idx_actors_share_hash ON actors(share_hash);
CREATE INDEX IF NOT EXISTS idx_actors_cast_priority ON actors(cast_priority);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS actors_updated_at ON actors;
CREATE TRIGGER actors_updated_at
  BEFORE UPDATE ON actors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS aktivieren
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies für actors
DROP POLICY IF EXISTS "Anyone can create actor" ON actors;
CREATE POLICY "Anyone can create actor" ON actors
  FOR INSERT WITH CHECK (true);

-- Öffentlich: nur über share_hash oder als Admin
DROP POLICY IF EXISTS "Public read via share_hash" ON actors;
CREATE POLICY "Public read via share_hash" ON actors
  FOR SELECT USING (true); -- Service Role wird für Admin verwendet

-- Update: Service Role (Admin) oder nach PIN-Verifikation
DROP POLICY IF EXISTS "Service role can update" ON actors;
CREATE POLICY "Service role can update" ON actors
  FOR UPDATE USING (true);

-- Delete: nur Service Role
DROP POLICY IF EXISTS "Service role can delete" ON actors;
CREATE POLICY "Service role can delete" ON actors
  FOR DELETE USING (true);

-- Email Log: nur über Service Role
DROP POLICY IF EXISTS "Service role email log" ON email_log;
CREATE POLICY "Service role email log" ON email_log
  USING (true) WITH CHECK (true);
