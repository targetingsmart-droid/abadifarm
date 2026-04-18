-- ============================================
-- ABADI FARM - Full Migration & Data Sync
-- Jalankan SEMUA ini sekaligus di Supabase SQL Editor
-- ============================================

-- STEP 1: Hapus semua check constraint lama
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT con.conname 
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'live_goats' AND con.contype = 'c'
  ) LOOP
    EXECUTE 'ALTER TABLE live_goats DROP CONSTRAINT ' || r.conname;
  END LOOP;
  
  FOR r IN (
    SELECT con.conname 
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'cooked_packages' AND con.contype = 'c'
  ) LOOP
    EXECUTE 'ALTER TABLE cooked_packages DROP CONSTRAINT ' || r.conname;
  END LOOP;
END $$;

-- STEP 2: Tambah kolom baru
ALTER TABLE live_goats ADD COLUMN IF NOT EXISTS goat_number TEXT;
ALTER TABLE live_goats ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE cooked_packages ADD COLUMN IF NOT EXISTS goat_number TEXT;
ALTER TABLE cooked_packages ADD COLUMN IF NOT EXISTS height TEXT;

-- STEP 3: Hapus data lama di live_goats
DELETE FROM live_goats;

-- STEP 4: Insert semua data katalog kambing ABADI FARM
-- BRONZE (Berat 20-25kg, Harga 1.5-2jt)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES ('Bronze', '23', '24kg', '88cm', 2000000, 'Berat: 24kg | Tinggi: 88cm', true);

-- SILVER (Berat 25-30kg, Harga 2.5-3jt)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Silver', '19', '27kg', '97cm', 2900000, 'Berat: 27kg | Tinggi: 97cm', true),
  ('Silver', '24', '27kg', '88cm', 3000000, 'Berat: 27kg | Tinggi: 88cm', true),
  ('Silver', '25', '28kg', '92cm', 3000000, 'Berat: 28kg | Tinggi: 92cm', true);

-- GOLD (Berat 30-40kg, Harga 3-4jt)
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

-- PLATINUM (Berat 40-45kg, Harga 4-4.5jt)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Platinum', '15', '44kg', '98cm', 4300000, 'Berat: 44kg | Tinggi: 98cm', true),
  ('Platinum', '18', '45kg', '108cm', 4500000, 'Berat: 45kg | Tinggi: 108cm', true),
  ('Platinum', '26', '45kg', '97cm', 4200000, 'Berat: 45kg | Tinggi: 97cm', true);

-- DIAMOND (Berat 45-60kg, Harga 4.5-7jt)
INSERT INTO live_goats (type, goat_number, weight_range, height, price, description, is_active)
VALUES 
  ('Diamond', '1', '45kg', '98cm', 4500000, 'Berat: 45kg | Tinggi: 98cm', true),
  ('Diamond', '5', '46kg', '93cm', 4600000, 'Berat: 46kg | Tinggi: 93cm', true),
  ('Diamond', '13', '60kg', '107cm', 7000000, 'Berat: 60kg | Tinggi: 107cm', true),
  ('Diamond', '14', '49kg', '107cm', 4700000, 'Berat: 49kg | Tinggi: 107cm', true),
  ('Diamond', '16', '57kg', '103cm', 6500000, 'Berat: 57kg | Tinggi: 103cm', true),
  ('Diamond', '17', '46kg', '108cm', 4900000, 'Berat: 46kg | Tinggi: 108cm', true);

-- STEP 5: Update tipe lama di cooked_packages (jika ada)
UPDATE cooked_packages SET type = 'Bronze' WHERE type = 'A';
UPDATE cooked_packages SET type = 'Silver' WHERE type = 'B';
UPDATE cooked_packages SET type = 'Gold' WHERE type = 'C';
UPDATE cooked_packages SET type = 'Platinum' WHERE type = 'D';
UPDATE cooked_packages SET type = 'Diamond' WHERE type = 'E';

-- STEP 6: Tambah constraint baru
ALTER TABLE live_goats ADD CONSTRAINT live_goats_type_check 
  CHECK (type IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'));

ALTER TABLE cooked_packages ADD CONSTRAINT cooked_packages_type_check 
  CHECK (type IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'));

-- ============================================
-- SELESAI! Total 27 kambing telah dimasukkan.
-- ============================================
