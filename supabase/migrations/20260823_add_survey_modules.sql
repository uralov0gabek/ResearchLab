-- 1. Create survey_modules table
CREATE TABLE IF NOT EXISTS public.survey_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS if not already enabled (assuming standard Supabase setup)
ALTER TABLE public.survey_modules ENABLE ROW LEVEL SECURITY;

-- Optional: Create basic RLS policies for survey_modules (adjust as needed for your app)
CREATE POLICY "Allow public read access to active survey modules" 
    ON public.survey_modules FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Allow admin full access to survey modules" 
    ON public.survey_modules FOR ALL 
    USING (true); -- Replace with actual auth.role() check if applicable

-- 2. Add module_id to questions table
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.survey_modules(id) ON DELETE CASCADE;

-- 3. (Optional) Insert some default modules if you want to start with them
-- INSERT INTO public.survey_modules (title, status) VALUES 
-- ('Generational Loss Aversion', 'active'),
-- ('Startup Ecosystem', 'draft'),
-- ('Founder Risk Tolerance', 'draft');
