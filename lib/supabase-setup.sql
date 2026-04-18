-- ============================================
-- ABADI FARM - Fresh Supabase Setup
-- Run this ONCE in a new Supabase project SQL Editor
-- ============================================

-- STEP 1: Create tables
CREATE TABLE IF NOT EXISTS live_goats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  goat_number TEXT,
  weight_range TEXT NOT NULL,
  height TEXT,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cooked_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  goat_number TEXT,
  weight_range TEXT NOT NULL,
  height TEXT,
  price INTEGER NOT NULL,
  description TEXT,
  menu_items TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 2: Enable Row Level Security
ALTER TABLE live_goats ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooked_packages ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create RLS policies
-- Public read access (anyone can view active products)
CREATE POLICY "Public can view active goats" ON live_goats
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active packages" ON cooked_packages
  FOR SELECT USING (is_active = true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access goats" ON live_goats
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access packages" ON cooked_packages
  FOR ALL USING (auth.role() = 'authenticated');

-- STEP 4: Create storage bucket for goat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('goat-images', 'goat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view goat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'goat-images');

CREATE POLICY "Admin can upload goat images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update goat images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete goat images" ON storage.objects
  FOR DELETE USING (bucket_id = 'goat-images' AND auth.role() = 'authenticated');

-- STEP 5: Insert all goat catalog data
-- BRONZE (Berat 20-25kg)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES ('Bronze', '23', '24kg', '88cm', 2000000, 'Berat: 24kg | Tinggi: 88cm', true);

-- SILVER (Berat 25-30kg)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Silver', '19', '27kg', '97cm', 2900000, 'Berat: 27kg | Tinggi: 97cm', true),
  ('Silver', '24', '27kg', '88cm', 3000000, 'Berat: 27kg | Tinggi: 88cm', true),
  ('Silver', '25', '28kg', '92cm', 3000000, 'Berat: 28kg | Tinggi: 92cm', true);

-- GOLD (Berat 30-40kg)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Gold', '2', '36kg', '94cm', 3900000, 'Berat: 36kg | Tinggi: 94cm', true),
  ('Gold', '3', '35kg', '95cm', 3700000, 'Berat: 35kg | Tinggi: 95cm', true),
  ('Gold', '4', '31kg', '94cm', 3400000, 'Berat: 31kg | Tinggi: 94cm', true),
  ('Gold', '6', '33kg', '93cm', 3600000, 'Berat: 33kg | Tinggi: 93cm', true),
  ('Gold', '7', '37kg', '92cm', 4000000, 'Berat: 37kg | Tinggi: 92cm', true),
  ('Gold', '8', '34kg', '94cm', 3700000, 'Berat: 34kg | Tinggi: 94cm', true),
  ('Gold', '9', '38kg', '95cm', 4000000, 'Berat: 38kg | Tinggi: 95cm', true),
  ('Gold', '10', '39kg', '97cm', 4000000, 'Berat: 39kg | Tinggi: 97cm', true),
  ('Gold', '11', '35kg', '95cm', 3800000, 'Berat: 35kg | Tinggi: 95cm', true),
  ('Gold', '12', '35kg', '97cm', 3800000, 'Berat: 35kg | Tinggi: 97cm', true),
  ('Gold', '20', '31kg', '97cm', 3450000, 'Berat: 31kg | Tinggi: 97cm', true),
  ('Gold', '21', '31kg', '95cm', 3500000, 'Berat: 31kg | Tinggi: 95cm', true),
  ('Gold', '22', '32kg', '95cm', 3400000, 'Berat: 32kg | Tinggi: 95cm', true),
  ('Gold', '27', '30kg', '89cm', 3500000, 'Berat: 30kg | Tinggi: 89cm', true);

-- PLATINUM (Berat 40-45kg)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Platinum', '15', '44kg', '98cm', 4300000, 'Berat: 44kg | Tinggi: 98cm', true),
  ('Platinum', '18', '45kg', '108cm', 4500000, 'Berat: 45kg | Tinggi: 108cm', true),
  ('Platinum', '26', '45kg', '97cm', 4200000, 'Berat: 45kg | Tinggi: 97cm', true);

-- DIAMOND (Berat 45-60kg)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Diamond', '1', '45kg', '98cm', 4500000, 'Berat: 45kg | Tinggi: 98cm', true),
  ('Diamond', '5', '46kg', '93cm', 4600000, 'Berat: 46kg | Tinggi: 93cm', true),
  ('Diamond', '13', '60kg', '107cm', 7000000, 'Berat: 60kg | Tinggi: 107cm', true),
  ('Diamond', '14', '49kg', '107cm', 4700000, 'Berat: 49kg | Tinggi: 107cm', true),
  ('Diamond', '16', '57kg', '103cm', 6500000, 'Berat: 57kg | Tinggi: 103cm', true),
  ('Diamond', '17', '46kg', '108cm', 4900000, 'Berat: 46kg | Tinggi: 108cm', true);

-- ============================================
-- STEP 6: Create admin user
-- Go to Authentication > Users in Supabase dashboard
-- Click "Add user" and create:
--   Email: admin@abadifarm.store
--   Password: (choose a strong password)
-- ============================================

-- DONE! 27 goats inserted across 5 tiers.
-- Tables: live_goats, cooked_packages
-- Storage: goat-images bucket
-- RLS: Public read, Admin full access
