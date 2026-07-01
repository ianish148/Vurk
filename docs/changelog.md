# Changelog

All notable changes to Vurk will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] (Phase 3 - AI & Storage)

### Planned
- Supabase Storage integration for File Uploads.
- Gemini API Integration for AI Verification.
- OCR and PDF parsing.
- AI Verification Queue and Manual Review UI.

## [v0.2.0] - Phase 2 Core Execution

### Added
- Created `docs/` directory for living documentation.
- Created `00006_phase2_production.sql` with the scalable database schema.
- Created `00007_phase2_transactions.sql` with idempotent transaction ledgers for XP and Coins.
- Added `lib/plugins/` with abstract interfaces for AI, Storage, Notifications, and Calendar.
- Implemented Server Actions for Roadmap and Task fetching.
- Built `/dashboard/roadmaps` Marketplace UI.
- Implemented Rolling Task Generator (Smart Scheduler) to generate only 7-14 days ahead.
- Built Task Submission Engine with Atomic RPC transactions (`complete_task_transaction`).

## [v0.1.0] - Phase 1 Completion

### Added
- Next.js 15 App router structure.
- Supabase Auth integration with custom user profiles.
- Onboarding Wizard with Zod validation.
- XP and Coin economy foundations.
