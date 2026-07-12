ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

UPDATE profiles p SET email = u.email
FROM auth.users u WHERE p.id = u.id AND p.email IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
