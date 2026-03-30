-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CHARITIES TABLE
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- USERS TABLE (extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_percentage NUMERIC (5,2) DEFAULT 10.00 CHECK (charity_percentage >= 10.00 AND charity_percentage <= 100.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    tier TEXT CHECK (tier IN ('monthly', 'yearly')),
    next_renewal TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SCORES TABLE
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 1 AND score <= 45),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to keep only the last 5 scores per user
CREATE OR REPLACE FUNCTION maintain_last_5_scores() 
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY date DESC, created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for maintaining last 5 scores
CREATE TRIGGER enforce_max_5_scores
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE PROCEDURE maintain_last_5_scores();

-- DRAWS TABLE
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('random', 'algorithmic')) NOT NULL,
    pool_5_match NUMERIC (10,2) DEFAULT 0.00,
    pool_4_match NUMERIC (10,2) DEFAULT 0.00,
    pool_3_match NUMERIC (10,2) DEFAULT 0.00,
    winning_numbers INT[] NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WINNERS TABLE
CREATE TABLE public.winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('5-number', '4-number', '3-number')),
    payout_amount NUMERIC (10,2) NOT NULL,
    proof_url TEXT,
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Dummy Data for Charities
INSERT INTO public.charities (name, description, active_status) VALUES
('Golf For Good', 'Supporting youth development through golf programs.', true),
('Green Drives', 'Environmental conservation on and off the course.', true),
('Tee Off Hunger', 'Local food bank support initiatives.', true);

-- Note: Ensure Row Level Security (RLS) is enabled and appropriate policies are applied for production use.
