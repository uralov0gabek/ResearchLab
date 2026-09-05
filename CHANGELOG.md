# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Comprehensive English documentation (README.md, CONTRIBUTING.md, CHANGELOG.md).
- Dedicated `.gitignore` files for backend and frontend.
- Added `NODE_ENV` to `.env.example` configurations.

### Changed
- Improved environment variable structure in `.env.example` files across root, frontend, and backend.
- Updated `render.yaml` to use `SUPABASE_SERVICE_ROLE_KEY` matching backend expectations.
- Removed hardcoded email placeholders in frontend login and settings pages.
- Modified `i18n.ts` configuration.

### Removed
- Removed 23 dead or unused files (tests, redundant migration scripts, unused layout components).
- Removed unused `xss-clean` middleware from backend.
- Cleaned up debug `console.log` statements that risked exposing secrets or large payloads.
