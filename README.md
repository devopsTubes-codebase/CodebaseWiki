# Codebase Wiki

Platform auto-generate dokumentasi dari codebase berbasis AI agent. User submit repo (ZIP atau GitHub URL), system scan & analisis codebase secara otomatis, lalu AI agent menghasilkan dokumentasi markdown terstruktur yang dipublish ke web docs.

Mirip GitBook, tapi isinya ditulis oleh agent.

> **Repository ini digunakan sebagai project aplikasi untuk Ujian Akhir Semester mata kuliah DevOps (CCK4IBB3).**
> Implementasi DevOps (Docker, Kubernetes, CI/CD, monitoring) akan dilakukan secara terpisah di repository config tersendiri.

## Overview

```
User submit codebase (ZIP / GitHub URL)
        ↓
System clone / extract kode
        ↓
Scan otomatis (struktur folder, dependency, tech stack)
        ↓
AI agent (OpenAI) analisis & perkaya konteks
        ↓
Generate dokumentasi markdown terstruktur
        ↓
Publish ke web docs
```

### Fitur

- **Import proyek** via upload ZIP atau GitHub URL + PAT
- **Codebase scanning** deterministik (folder, dependency, tech stack, important files)
- **AI enrichment** untuk konteks dan struktur dokumentasi
- **Multi-page doc generation** dengan sidebar navigasi
- **Semantic search** dengan embedding vector index
- **Wiki chat** untuk tanya-jawab tentang dokumentasi
- **Docs history** dengan versioning dan regenerate
- **MCP server** untuk integrasi dengan tools AI lain

## Structure

```
refactoryhackathon/
├── apps/
│   ├── web/                     # Next.js 14 frontend + thin route handlers
│   │   ├── app/
│   │   │   ├── api/             # Route handlers (auth, projects, MCP, search)
│   │   │   ├── auth/            # Sign-in / sign-up pages
│   │   │   ├── dashboard/       # Project list & generating status
│   │   │   ├── docs/[projectId] # Docs reader with sidebar & search
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── page.tsx         # Landing page
│   │   ├── components/
│   │   │   ├── auth/            # AuthForm, AuthPageLayout
│   │   │   ├── dashboard/       # DashboardClient, jobLogView
│   │   │   ├── docs/            # DocsReader, DocsSidebarNav, SourceCodeTabs
│   │   │   ├── landing/         # LandingImportForm
│   │   │   └── ui/              # AppShell, GlassCard, GradientButton, LogoMark
│   │   └── lib/
│   │       ├── auth/            # NextAuth config & session
│   │       └── env/             # Environment loader
│   └── api/                     # Service layer (business logic)
│       ├── controllers/         # Project intake & regenerate controllers
│       ├── integrations/        # GitHub client, OpenAI client
│       ├── services/
│       │   ├── ai-doc-generation/   # Prompt builder, markdown formatter, sidebar generator
│       │   ├── auth/                # Auth service
│       │   ├── codebase-analysis/   # Deterministic scanner, enrichment boundary, tech stack detector
│       │   ├── job-logs/            # Job logging with phases
│       │   ├── mcp/                 # MCP server (search_docs, ask_wiki, get_page)
│       │   ├── postgres/            # PostgreSQL stores (docs, projects, vector index, PAT, chat)
│       │   ├── project-intake/      # ZIP & GitHub URL validation
│       │   ├── regenerate/          # Regenerate docs trigger
│       │   ├── semantic-search/     # Vector index & embedding search
│       │   ├── source-ingestion/    # Clone repo & extract ZIP
│       │   ├── storage/             # Documentation store & history
│       │   └── wiki-chat/           # Chat sessions over docs
│       ├── types/                   # Shared TypeScript types
│       ├── utils/                   # Backend contracts, errors, safe logging
│       └── config.ts                # Backend configuration
├── .env.example                 # Environment variables template
└── package.json                 # Root workspace config
```

## Setup

### 1. Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL database

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` dan set variabel yang dibutuhkan (lihat [Environment Variables](#environment-variables) di bawah).

### 4. Run development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Architecture

### Frontend (`apps/web`)

- **Next.js 14** dengan App Router
- **Tailwind CSS** untuk styling
- **NextAuth 4** untuk authentication
- **Thin route handlers** yang delegasi ke `@codebase-wiki/api`
- UI components dengan desain glassmorphism (GlassCard, GradientButton, AppShell)

### Service Layer (`apps/api`)

- **Business logic** terpisah dari Next.js runtime
- **Testable** tanpa dependency ke Next.js
- **Reusable** untuk frontend lain
- Contract-based design dengan dependency injection

### Pipeline

1. **Project Intake** — Validasi ZIP upload atau GitHub URL + PAT
2. **Source Ingestion** — Clone repo (simple-git) atau extract ZIP (adm-zip)
3. **Codebase Analysis** — Deterministic scan + AI enrichment (OpenAI)
4. **AI Doc Generation** — Prompt building, markdown generation, sidebar structure
5. **Storage** — Simpan docs ke PostgreSQL dengan history retention
6. **Semantic Search** — Index embedding untuk pencarian semantik (vectra)
7. **Wiki Chat** — Chat session berbasis konteks dokumentasi

### Storage Model

| Store | Fungsi |
|-------|--------|
| Temporary Source | Area kerja ephemeral untuk ZIP/repo yang sedang diproses |
| Documentation Store | Docs saat ini per project |
| Docs History | Riwayat versi docs yang pernah di-generate |
| Encrypted PAT Store | Token GitHub terenkripsi per user (cryptr) |
| Vector Index Store | Embedding index untuk semantic search |
| Job Log Store | Log processing per project dengan fase |
| Wiki Chat Store | Session & message chat |

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- NextAuth 4

### Backend

- Node.js 18+
- TypeScript 5
- PostgreSQL (pg)
- OpenAI SDK
- simple-git (GitHub clone)
- adm-zip (ZIP extraction)
- vectra (vector index / semantic search)
- cryptr (PAT encryption)
- remark + remark-gfm (markdown processing)

### Testing

- Jest 30
- ts-jest

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Start development server (apps/web) |
| `npm run build` | Build all workspaces |
| `npm run start` | Start production server |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run tests in all workspaces |

## Environment Variables

### Required

| Variable | Deskripsi |
|----------|-----------|
| `OPENAI_API_KEY` | API key untuk AI doc generation |
| `DATABASE_URL` | PostgreSQL connection string |
| `ENCRYPTION_SECRET_KEY` | Secret 32 karakter untuk enkripsi PAT |
| `NEXTAUTH_SECRET` | Secret untuk session NextAuth |

### Optional

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Base URL OpenAI-compatible API |
| `AI_MODEL` | `gpt-4-turbo-preview` | Model untuk doc generation |
| `AI_EMBEDDING_MODEL` | `text-embedding-3-small` | Model untuk embedding |
| `MAX_ZIP_SIZE` | `52428800` (50MB) | Ukuran maksimum ZIP upload |
| `TEMP_STORAGE_PATH` | `/tmp/codebase-wiki` | Path penyimpanan sementara source |
| `CLEANUP_TTL` | `1800000` (30 min) | TTL cleanup storage sementara |
| `DOCS_STORAGE_PATH` | `/tmp/codebase-wiki-docs` | Path penyimpanan docs |
| `VECTOR_INDEX_PATH` | `/tmp/codebase-wiki-index` | Path penyimpanan vector index |
| `GITHUB_CLONE_TIMEOUT` | `300000` (5 min) | Timeout clone GitHub repo |
| `GITHUB_DEFAULT_BRANCH` | `main` | Default branch untuk clone |
| `NEXTAUTH_URL` | - | URL publik aplikasi |
