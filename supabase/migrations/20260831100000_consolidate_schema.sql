-- Drop old redundant tables if they exist
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.cpt_results CASCADE;
DROP TABLE IF EXISTS public.cpt_tasks CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.survey_modules CASCADE;
DROP TABLE IF EXISTS public.respondent_emails CASCADE;

-- 1. Create Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_name TEXT NOT NULL, -- e.g., 'Section A', 'Block 1'
    question_text TEXT NOT NULL,
    type TEXT NOT NULL, -- 'multiple_choice', 'short_answer', 'lottery'
    options JSONB, -- For multiple choice options or lottery details
    conditional_logic JSONB, -- e.g., {"depends_on": "Q1", "condition": "equals", "value": "I run my own business"}
    order_index INTEGER DEFAULT 0,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Create Responses Table
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null for anonymous respondents
    answers JSONB DEFAULT '{}'::jsonb NOT NULL, -- Store all answers keyed by question ID or alias
    calculated_cpt_parameters JSONB, -- Store { alpha: ..., beta: ..., lambda: ... }
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Set up Row Level Security (RLS)

-- Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can manage questions" ON public.questions FOR ALL USING (auth.role() = 'authenticated');

-- Responses
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert responses" ON public.responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own responses or admins can view all" ON public.responses 
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        (auth.uid() = user_id AND user_id IS NOT NULL)
    );
CREATE POLICY "Users can update their own responses" ON public.responses
    FOR UPDATE USING (auth.uid() = user_id AND user_id IS NOT NULL);
