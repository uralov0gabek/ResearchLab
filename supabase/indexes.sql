-- Database Indexes for Performance Optimization

-- 1. Index on responses table for fast lookups by session_id
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON public.responses (session_id);

-- 2. Index on responses table for created_at (useful for Admin Overview charts sorting by date)
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON public.responses (created_at DESC);

-- 3. Index on questions table for block_name to speed up question grouping
CREATE INDEX IF NOT EXISTS idx_questions_block_name ON public.questions (block_name);

-- 4. Index on questions table for order_index
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON public.questions (order_index);

-- 5. Index on cpt_tasks table for block_name
CREATE INDEX IF NOT EXISTS idx_cpt_tasks_block_name ON public.cpt_tasks (block_name);
