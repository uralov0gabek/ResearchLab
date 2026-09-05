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
