# Supabase Database Configuration

This directory contains the database schema, migrations, and seed files for the Research Lab backend.

## Setting Up

1. Log into the Supabase Dashboard.
2. Go to the **SQL Editor**.
3. Copy the contents of `schema.sql` and run it. This will:
   - Create tables (`survey_modules`, `questions`, `cpt_tasks`, `responses`).
   - Enable Row Level Security (RLS).
   - Set up appropriate permissions.
4. Note: If you already have data, be careful as `schema.sql` currently drops existing tables by default to ensure a clean slate. Adjust `schema.sql` (remove `DROP TABLE`) if you want to apply updates non-destructively.

## CPT Survey Questions

`seed.sql` now links the seeded CPT tasks to survey questions. For an existing
database that has CPT tasks but no lottery questions, apply
`migrations/20261008000000_link_cpt_survey_questions.sql`. This migration appends
questions without deleting existing data and does nothing when CPT questions
are already configured.

Response calculations use a certainty-equivalent estimator with objective
probabilities. Gamma and delta are unavailable because this estimator does not
fit probability weighting. Missing, incomplete, or inconsistent choices produce
unavailable estimates instead of default research parameters. Old responses
are recalculated on read from their saved row snapshots where those snapshots
contain enough information; newly calculated responses retain versioned results.
