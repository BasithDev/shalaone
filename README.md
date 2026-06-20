# ShalaOne — AI Study Companion

ShalaOne is an AI-powered study companion for school students (Grades 6–12). Students pick their board, class, and subjects, then **read their textbooks, ask doubts answered straight from those textbooks, take auto-generated quizzes, upload their own notes, and track mastery** — all grounded in the actual curriculum content an admin uploads.

The AI never makes things up: every doubt answer is grounded in the chapter's textbook (Retrieval-Augmented Generation), and even **scanned/image PDFs** are read via OCR.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [How the AI works](#how-the-ai-works)
- [How progress works](#how-progress-works)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Gemini setup](#gemini-setup)
- [Local development](#local-development)
- [Creating an admin](#creating-an-admin)
- [Admin workflow](#admin-workflow)
- [Student workflow](#student-workflow)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

### Student
- **Bookbag (Subjects)** — read or download the textbook PDF for every chapter in your selected subjects.
- **AI Doubt Chat** — ask any question about a chapter; the AI answers using the **whole chapter** and stays strictly on-syllabus. Citations appear only when you ask ("which page?").
- **Quizzes** — generate a 10-question MCQ quiz for any chapter, take it, and get scored instantly.
- **Notes** — upload your own notes (PDF/JPG/PNG); PDFs are made searchable inside Doubt Chat.
- **Progress** — per-subject mastery, a syllabus map, and focus areas, all driven by quiz performance.
- **Streak** — counts consecutive days you upload notes.

### Admin
- **Curriculum management** — CRUD for Boards → Classes → Subjects → Chapters.
- **Textbook upload** — upload a chapter PDF; the app extracts text (or **OCRs scanned PDFs**), chunks it, embeds it, and indexes it for AI search.
- **Content Gaps** — see which chapters are still missing a textbook.
- **Analytics** — students, onboarding, curriculum counts, content coverage, quiz/doubt/notes activity, and student breakdowns by class and board.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 ("Academic Flux" design system) |
| Auth | Supabase Auth (email + OTP verification) |
| Database | Supabase Postgres + `pgvector`, accessed via Drizzle ORM |
| File storage | Supabase Storage (buckets: `books`, `notes`) |
| AI | Google Gemini — `gemini-3.1-flash-lite` (text/OCR), `gemini-embedding-001` (embeddings) |
| Package manager | pnpm |

---

## How the AI works

1. **Ingestion (admin upload):** a chapter PDF is parsed page-by-page. If it has no text layer (a scan), it falls back to **Gemini multimodal OCR**. The text is split into ~700-char chunks, each embedded to a **768-dim vector** (`gemini-embedding-001`) and stored in `book_chunks` with an HNSW index.
2. **Doubt answering (RAG):** the app loads the **entire chapter** (all chunks, plus the student's own note chunks) — or, for very large chapters, the most relevant chunks — and sends them to `gemini-3.1-flash-lite` with a grounded prompt. The answer is streamed back and the session is saved.
3. **Quizzes:** chapter content is sent to Gemini with a strict JSON schema (validated with Zod) to produce 10 MCQs.

> **Zero-cost:** everything runs on the **Gemini free tier** and Supabase's free tier. No paid email/AI services are required.

---

## How progress works

Progress is **driven entirely by quiz scores**. Each chapter has one status per student, stored in `study_progress`:

| Quiz score | Status |
|---|---|
| **≥ 80%** | `mastered` |
| **60–79%** | `in_progress` |
| **< 60%** | `weak` |

- New chapters start as `not_started` (created at onboarding for your selected subjects).
- Each quiz attempt **overwrites** the chapter's status (latest result wins; retaking can move it up or down).
- **Subject % = chapters mastered ÷ total chapters.** Only `mastered` counts toward the percentage.
- Reading the textbook or asking doubts does **not** change progress — only quizzes do.

---

## Prerequisites

- **Node.js 20+**
- **pnpm** (`npm i -g pnpm`)
- A **Supabase** project (free tier)
- A **Google Gemini** API key from [Google AI Studio](https://aistudio.google.com/apikey) (free tier)

---

## Environment variables

Create a `.env` file in the project root (see `.env.example`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only — bypasses RLS for uploads/profile creation) |
| `DATABASE_URL` | Postgres connection string — **use the Supabase pooler (port 6543)** for serverless |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | Text/OCR model, e.g. `gemini-3.1-flash-lite` |

---

## Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com) and copy the URL + anon key + service-role key (Settings → API), and the **pooler** connection string (Settings → Database → Connection pooling, port `6543`) into `DATABASE_URL`.
2. **Enable pgvector:** SQL Editor → run `create extension if not exists vector;`
3. **Push the schema:** `pnpm drizzle-kit push` (creates all tables from `src/db/schema.ts`).
4. **Create the vector + FK indexes:** run the contents of `src/db/indexes.sql` in the SQL Editor (HNSW indexes for fast similarity search).
5. **(Optional) Apply RLS policies:** run `src/db/rls.sql`.
6. **Create storage buckets** (Storage → New bucket):
   - `books` — **public**
   - `notes` — **private**
7. **Auth configuration** (Authentication):
   - **Sign In / Providers → Email:** enable, and turn **Confirm email** ON.
   - **Emails → Templates:** in **Confirm signup** and **Reset Password**, use the OTP token, e.g. `<h1>{{ .Token }}</h1>` (this app verifies with a code, not a magic link).
   - **Emails → SMTP Settings:** configure custom SMTP so verification/reset emails reach any address (the built-in mailer only reaches your own team). Gmail SMTP (`smtp.gmail.com:465` + a Google App Password) works on the free tier.
   - **URL Configuration → Site URL:** set to your app's URL (localhost in dev, your domain in prod).
8. **(Optional) Seed sample curriculum:** `npx tsx src/db/seed.ts` (creates a CBSE board with Classes 9–10 and a few subjects/chapters). You can also build everything from the Admin UI.

---

## Gemini setup

1. Get a free API key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Put it in `GEMINI_API_KEY`.
3. Set `GEMINI_MODEL=gemini-3.1-flash-lite` (or another current Gemini flash model). Embeddings use `gemini-embedding-001` at 768 dimensions to match the DB schema.

---

## Local development

```bash
pnpm install
pnpm dev          # start the dev server at http://localhost:3000
```

Other scripts:

```bash
pnpm build        # production build
pnpm start        # run the production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
```

---

## Creating an admin

Every new account is a **student** by default. To make an account an admin, run this in the Supabase SQL Editor (replace the email):

```sql
update profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Log out and back in — admins are routed to `/admin`.

---

## Admin workflow

1. Sign in as an admin → you land on `/admin`.
2. **Boards** → add a board (e.g. CBSE).
3. **Classes** → pick the board, add classes (e.g. Class 10).
4. **Subjects** → pick board + class, add subjects (e.g. Mathematics).
5. **Chapters & Books** → pick board + class + subject, add chapters, then **upload a textbook PDF** per chapter. Text/scanned PDFs are both supported (scanned ones go through OCR).
6. **Content Gaps** → review chapters still missing a book.
7. **Analytics** → monitor students and engagement.

---

## Student workflow

1. **Sign up** → enter the verification code emailed to you.
2. **Onboarding** → choose board, class, and subjects.
3. **Bookbag** → read/download textbooks.
4. **Doubts** → pick a subject + chapter and ask questions.
5. **Quizzes** → generate and take quizzes to build mastery.
6. **Notes** → upload your own notes.
7. **Progress** → track mastery. Manage your class/subjects in **Settings → Academic Info**, and see **Settings → Help** for a full how-to.

---

## Project structure

```
src/
  app/
    (auth)/            # login / signup / OTP verify / forgot-password UI
    (student)/         # dashboard, doubts, quizzes, notes, subjects, progress, settings
    admin/             # admin console (curriculum CRUD, analytics, uploads)
    api/               # route handlers (doubt, quiz, uploads, auth/ensure-profile)
    onboarding/        # first-run board/class/subject selection
  db/
    schema.ts          # Drizzle schema (source of truth)
    indexes.sql        # HNSW + FK indexes (run manually in Supabase)
    rls.sql            # row-level security policies
    seed.ts            # optional sample curriculum
  lib/
    ai/                # gemini client, embeddings, OCR, retrieval, generation, quiz prompt
    queries/           # data-access helpers
    supabase/          # browser + server Supabase clients
    validations/       # Zod schemas
  proxy.ts             # middleware: session refresh + role-based routing
```

---

## Deployment

The app deploys to **Vercel** (it auto-detects Next.js + pnpm). At a high level: push to GitHub, import the repo in Vercel, add the six environment variables above (make sure `DATABASE_URL` uses the Supabase **pooler**, port 6543), set the Supabase Auth **Site URL** to your Vercel domain, and deploy. See your deployment checklist for the full step-by-step.

---

## Limitations & trade-offs

This is an MVP built on a tight timeline. The choices below were deliberate — documented here for transparency.

### Things we'd add with more time
- **OCR for image notes** — uploaded **images** are stored but not text-extracted, so only **PDF** notes become AI-searchable. (Textbook scans *are* OCR'd on the admin side.) The same Gemini OCR could be wired into note images later.
- **Admin management UI** — promoting a user to admin is done via SQL; there's no admin-management screen yet.
- **Automated tests** — verification was manual (typecheck + build + manual flows). No unit/E2E suite yet.
- **Richer analytics** — current analytics are point-in-time counts; time-series trends and per-student drill-downs aren't built.
- **Quiz coverage for huge chapters** — for chapters larger than the prompt budget, quiz generation **samples** chunks rather than doing hierarchical summarization, so very large chapters may not be fully represented.
- **Dashboard query** — `getSubjectProgress` runs one query per subject (N+1); fine at this scale, but it should be flattened for large datasets.

### Why we chose these approaches
- **Supabase over a separate auth provider (e.g. Clerk):** Supabase already provides **auth + Postgres (with pgvector) + storage** in one place. Swapping only auth to another service wouldn't remove the Supabase dependency (DB + storage remain) and would add a sizable refactor — not worth it for an MVP.
- **Email OTP codes (not magic links):** codes work without configuring redirect/callback URLs and are simple to reason about. Delivery uses Supabase SMTP (a free Gmail/Brevo SMTP works); the built-in mailer is rate-limited, so custom SMTP is recommended.
- **Whole-chapter context for doubts (not just top-k vector hits):** chapters are small enough to send in full, which lets the AI answer "summarize the chapter"-type questions reliably. Very large chapters fall back to budget-bounded semantic retrieval.
- **Progress is quiz-only:** quiz scores are an objective, unambiguous signal of understanding, so mastery is derived purely from them (reading/doubts don't change status).
- **Gemini free tier end-to-end:** keeps the whole app zero-cost. The trade-off is occasional rate limits on large/batched operations (e.g. embedding a very large scanned PDF).
- **`gemini-embedding-001` @ 768 dims:** the model defaults to 3072 dims; we request 768 to match the DB vector column and keep the index small.

> A short version of these notes is shown to users in a one-time welcome modal on first login.

## Troubleshooting

- **Verification email not arriving** — configure custom SMTP in Supabase (the built-in mailer is rate-limited and only emails your own team). Check the spam folder; make sure the email template uses `{{ .Token }}`.
- **OTP code length** — Supabase decides the length; the app accepts 6–8 digit codes.
- **"Couldn't generate embeddings" / 404 on a model** — make sure `GEMINI_MODEL` is a current model and your key is a valid AI Studio key. Embeddings require `gemini-embedding-001`.
- **PDF upload fails** — ensure the `books` storage bucket exists (public). Scanned PDFs are OCR'd, but very large PDFs may hit Gemini free-tier rate limits.
- **Can't reach `/admin`** — your account is a student; promote it with the SQL above.
- **Vercel + database** — `DATABASE_URL` must use the pooler (port 6543); the direct connection won't work reliably on serverless.
