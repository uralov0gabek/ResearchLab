-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'multiple_choice', 'text', 'scale'
    options JSONB, -- For multiple choice options
    order_index INTEGER DEFAULT 0,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Responses Table (represents a single user taking the survey)
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT, -- To track anonymous users or authenticated user ID
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Answers Table
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    value JSONB NOT NULL, -- Can store text, numbers, or arrays (multiple choice)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)

-- 1. Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read questions
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

-- Allow authenticated users to manage questions
CREATE POLICY "Authenticated users can insert questions" ON public.questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update questions" ON public.questions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete questions" ON public.questions
    FOR DELETE USING (auth.role() = 'authenticated');


-- 2. Responses
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a response
CREATE POLICY "Anyone can insert responses" ON public.responses
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view all responses
CREATE POLICY "Authenticated users can view responses" ON public.responses
    FOR SELECT USING (auth.role() = 'authenticated');


-- 3. Answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert an answer
CREATE POLICY "Anyone can insert answers" ON public.answers
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view all answers
CREATE POLICY "Authenticated users can view answers" ON public.answers
    FOR SELECT USING (auth.role() = 'authenticated');
