-- Create CPT Tasks Table
CREATE TABLE public.cpt_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    block TEXT NOT NULL, -- 'gain', 'loss', 'mixed'
    sure_amount NUMERIC NOT NULL,
    gamble_a_amount NUMERIC NOT NULL,
    gamble_a_prob NUMERIC NOT NULL, -- e.g., 0.5
    gamble_b_amount NUMERIC NOT NULL,
    gamble_b_prob NUMERIC NOT NULL, -- e.g., 0.5
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CPT Results Table
CREATE TABLE public.cpt_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    alpha NUMERIC,
    beta NUMERIC,
    lambda NUMERIC,
    gamma NUMERIC,
    delta NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(response_id)
);

-- Create Respondent Emails Table (detached for privacy)
CREATE TABLE public.respondent_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for CPT Tasks
ALTER TABLE public.cpt_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cpt_tasks" ON public.cpt_tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage cpt_tasks" ON public.cpt_tasks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- RLS for CPT Results
ALTER TABLE public.cpt_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert cpt_results" ON public.cpt_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view cpt_results" ON public.cpt_results FOR SELECT USING (auth.role() = 'authenticated');

-- RLS for Emails
ALTER TABLE public.respondent_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert emails" ON public.respondent_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view emails" ON public.respondent_emails FOR SELECT USING (auth.role() = 'authenticated');

-- Alter existing tables
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS depends_on JSONB;
ALTER TABLE public.survey_modules ADD COLUMN IF NOT EXISTS target_role TEXT;
