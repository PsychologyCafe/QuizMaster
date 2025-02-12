/*
  # Fix Profiles and Friend Requests

  1. Changes
    - Create profiles table if not exists
    - Add foreign key from friend_requests to profiles
    - Add RLS policies for profiles table
    - Add necessary indexes

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Add foreign key from friend_requests to profiles
ALTER TABLE friend_requests
ADD CONSTRAINT friend_requests_from_user_id_profile_fkey
FOREIGN KEY (from_user_id) REFERENCES profiles(id);

ALTER TABLE friend_requests
ADD CONSTRAINT friend_requests_to_user_id_profile_fkey
FOREIGN KEY (to_user_id) REFERENCES profiles(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);