# Leaflingo

**Learn languages, the natural way.**

Leaflingo is a web platform for studying languages and preparing for
international language exams. It currently supports **English (IELTS)** and
**German (TestDaF)**, with a switcher for picking the language and exam you are
practicing.

## What it does

- **Practice hub** — pick the kind of test you want to take from a single
  selection screen.
- **Daily practice** — a mixed set of up to 20 questions that always covers
  every configured material type (text and audio), with a varying number of
  questions per type.
- **Reading** — comprehension questions based on text passages.
- **Listening** — questions based on audio recordings *and* video clips.
- **Writing** — an essay prompt with a writing area and submission.
- **Results** — a score screen with a mood emoji fetched from an external API
  that reflects how well you did.
- **Accounts** — registration, login and email confirmation via Supabase Auth,
  plus a user profile.
- **Admin** — an authoring screen for creating questions and materials
  (text / audio / video), uploaded to Supabase Storage.

## Tech stack

- [Nuxt 4](https://nuxt.com/) + [Vue 3](https://vuejs.org/) (TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com/) (via the Vite plugin)
- [Supabase](https://supabase.com/) — Postgres database, Auth and Storage
  (`@nuxtjs/supabase`)
- [Pinia](https://pinia.vuejs.org/) for state management
- [`@nuxt/icon`](https://github.com/nuxt/icon) for icons
- [VueUse](https://vueuse.org/)

## Installation & setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- A [Supabase](https://supabase.com/) project (cloud or local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `SUPABASE_URL`        | Your Supabase project URL                          |
| `SUPABASE_KEY`        | Supabase anon (public) key                         |
| `SUPABASE_SECRET_KEY` | Supabase service-role key (server-side use)        |
| `GPT_API_SECRETE_KEY` | API key for AI features (optional)                 |

### 3. Apply the database schema

The database schema lives in [`supabase/migrations`](supabase/migrations).
Apply it to your project with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db push
```

You will also need a public Storage bucket named `materials` for audio/video
uploads.

## Running

Start the development server on [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

### Other scripts

```bash
npm run build      # build for production
npm run preview    # preview the production build locally
npm run generate   # generate a static build
```

## Project structure

```
app/
  components/   shared UI (Header, Sidebar, ExamSwitcher, Result, …)
  layouts/      app shell
  pages/        routes
    tasks/      the practice tests (daily, reading, listening, writing)
    admin/      authoring screens
  stores/       Pinia stores (exam, profile)
  types/        TypeScript types (incl. generated Supabase types)
supabase/
  migrations/   database schema
```
