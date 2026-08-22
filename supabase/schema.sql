-- Create custom types
CREATE TYPE survey_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE user_role AS ENUM ('admin', 'researcher', 'participant');

-- User Roles Table (extends auth.users)
CREATE TABLE public.user_roles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'participant',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Surveys Table
CREATE TABLE public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Survey Versions Table
CREATE TABLE public.survey_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    status survey_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(survey_id, version_number)
);

-- Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_version_id UUID REFERENCES public.survey_versions(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- e.g., 'text', 'multiple_choice', 'scale'
    text TEXT NOT NULL,
    options JSONB, -- For multiple choice options, scale configs, etc.
    order_index INTEGER NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Responses Table
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_version_id UUID REFERENCES public.survey_versions(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous
    session_id TEXT, -- To group anonymous answers from same browser session if needed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers Table
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Setup

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (auth.is_admin());

-- Policies for surveys
CREATE POLICY "Admins have full access to surveys" ON public.surveys FOR ALL USING (auth.is_admin());
CREATE POLICY "Anyone can view published surveys" ON public.surveys FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.survey_versions 
        WHERE survey_versions.survey_id = surveys.id AND survey_versions.status = 'published'
    )
);

-- Policies for survey_versions
CREATE POLICY "Admins have full access to survey versions" ON public.survey_versions FOR ALL USING (auth.is_admin());
CREATE POLICY "Anyone can view published survey versions" ON public.survey_versions FOR SELECT USING (status = 'published');

-- Policies for questions
CREATE POLICY "Admins have full access to questions" ON public.questions FOR ALL USING (auth.is_admin());
CREATE POLICY "Anyone can view questions for published surveys" ON public.questions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.survey_versions 
        WHERE survey_versions.id = questions.survey_version_id AND survey_versions.status = 'published'
    )
);

-- Policies for responses
CREATE POLICY "Admins can view all responses" ON public.responses FOR SELECT USING (auth.is_admin());
CREATE POLICY "Anyone can insert responses" ON public.responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can view own responses" ON public.responses FOR SELECT USING (auth.uid() = participant_id);

-- Policies for answers
CREATE POLICY "Admins can view all answers" ON public.answers FOR SELECT USING (auth.is_admin());
CREATE POLICY "Anyone can insert answers" ON public.answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can view own answers" ON public.answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.responses 
        WHERE responses.id = answers.response_id AND responses.participant_id = auth.uid()
    )
);
