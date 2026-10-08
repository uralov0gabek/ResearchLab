-- Add CPT survey questions only when the survey has no CPT questions yet.
-- Existing questions, responses, and explicitly configured CPT questions are preserved.
WITH task_groups AS (
  SELECT COALESCE(substring(title FROM '^([GLM][0-9]+)'), block) AS group_name,
    jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'block', block, 'sureAmount', sure_amount,
      'gamble_a_amount', gamble_a_amount, 'gamble_a_prob', gamble_a_prob,
      'gamble_b_amount', gamble_b_amount, 'gamble_b_prob', gamble_b_prob,
      'gamble', gamble_a_prob || '% chance to ' ||
        CASE WHEN gamble_a_amount < 0 THEN 'lose ' ELSE 'win ' END || abs(gamble_a_amount) ||
        ' or ' || gamble_b_prob || '% chance to ' ||
        CASE WHEN gamble_b_amount < 0 THEN 'lose ' ELSE 'win ' END || abs(gamble_b_amount)
    ) ORDER BY title, id) AS options
  FROM public.cpt_tasks
  GROUP BY COALESCE(substring(title FROM '^([GLM][0-9]+)'), block)
), ordered_groups AS (
  SELECT *, row_number() OVER (ORDER BY group_name) AS position
  FROM task_groups
)
INSERT INTO public.questions (block_name, question_text, type, options, order_index, required)
SELECT 'Section J. CPT choices', group_name || '. Which option would you choose?',
  'lottery', options,
  (SELECT COALESCE(max(order_index), 0) FROM public.questions) + position * 10, true
FROM ordered_groups
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE type IN ('lottery', 'CPT'));
