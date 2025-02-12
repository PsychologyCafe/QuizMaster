/*
  # Add Friend System Tables

  1. New Tables
    - `friend_requests`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, references auth.users)
      - `to_user_id` (uuid, references auth.users)
      - `status` (text: pending, accepted, rejected)
      - `created_at` (timestamptz)
    
    - `friends`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `friend_username` (text)
      - `status` (text: active)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for friend requests and friends management
*/

-- Create friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES auth.users NOT NULL,
  to_user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_friend_request UNIQUE (from_user_id, to_user_id)
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  friend_username text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policies for friend_requests
CREATE POLICY "Users can create friend requests"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their sent or received friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can update friend requests sent to them"
  ON friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id);

-- Policies for friends
CREATE POLICY "Users can manage their friends"
  ON friends FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);