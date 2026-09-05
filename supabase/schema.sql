-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.cpt_tasks CASCADE;
DROP TABLE IF EXISTS public.survey_modules CASCADE;

-- Survey Modules Table (Optional grouping, but requested by user)
CREATE TABLE public.survey_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.survey_modules(id) ON DELETE SET NULL,
    block_name TEXT, -- E.g. "Section A. Basic demographics"
    question_text TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'multiple_choice', 'single_choice', 'short_text', 'number_input', 'slider', 'matrix'
    options JSONB, -- For multiple choice options or slider config
    conditional_logic JSONB, -- Defines if this question depends on others
    order_index INTEGER DEFAULT 0, -- Consider adding UNIQUE (module_id, order_index)
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CPT Tasks Table (Cumulative Prospect Theory)
CREATE TABLE public.cpt_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL, -- E.g. "G1a. Take 200,000 UZS for sure or gamble"
    block TEXT NOT NULL, -- 'gain', 'loss', 'mixed'
    sure_amount NUMERIC NOT NULL,
    gamble_a_amount NUMERIC NOT NULL,
    gamble_a_prob NUMERIC NOT NULL, -- percentage 0-100
    gamble_b_amount NUMERIC NOT NULL,
    gamble_b_prob NUMERIC NOT NULL, -- percentage 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Responses Table (represents a single user taking the survey)
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- For authenticated users, if any
    session_id TEXT, -- To track anonymous users
    answers JSONB, -- Key-value map of question_id -> user answer
    calculated_cpt_parameters JSONB, -- Stores the calculated alpha, beta, lambda, gamma, delta
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Set up Row Level Security (RLS)

-- 1. Survey Modules
ALTER TABLE public.survey_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view modules" ON public.survey_modules;
CREATE POLICY "Anyone can view modules" ON public.survey_modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage modules" ON public.survey_modules;
CREATE POLICY "Admin can manage modules" ON public.survey_modules FOR ALL USING (auth.role() = 'authenticated');

-- 2. Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage questions" ON public.questions;
CREATE POLICY "Admin can manage questions" ON public.questions FOR ALL USING (auth.role() = 'authenticated');

-- 3. CPT Tasks
ALTER TABLE public.cpt_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view cpt_tasks" ON public.cpt_tasks;
CREATE POLICY "Anyone can view cpt_tasks" ON public.cpt_tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can manage cpt_tasks" ON public.cpt_tasks;
CREATE POLICY "Admin can manage cpt_tasks" ON public.cpt_tasks FOR ALL USING (auth.role() = 'authenticated');

-- 4. Responses
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert responses" ON public.responses;
CREATE POLICY "Anyone can insert responses" ON public.responses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can view responses" ON public.responses;
CREATE POLICY "Authenticated users can view responses" ON public.responses FOR SELECT USING (auth.role() = 'authenticated');

-- Grant permissions to standard Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.survey_modules TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.questions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cpt_tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.responses TO anon, authenticated, service_role;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
