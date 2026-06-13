## Context

Codebase Wiki membutuhkan backend-first MVP karena UI sedang dikerjakan paralel oleh desainer. Berdasarkan PRD, ADR, dan C4 model, backend harus menjadi fondasi untuk menerima source project (ZIP/GitHub URL), mengakses private repository dengan PAT, menganalisis codebase, menghasilkan dokumentasi multi-page Markdown, menyimpan docs history, menyiapkan semantic search, dan menyediakan regenerate endpoint untuk GitHub Actions.

Stack yang sudah diputuskan:

- Next.js / React untuk aplikasi utama
- Next.js API Routes / Node.js untuk backend MVP
- NextAuth/Auth.js untuk auth/session
- `git clone` untuk GitHub import
- OpenAI-compatible API adapter untuk AI provider
- encrypted file storage per user untuk PAT
- temporary source storage di `/tmp`
- docs output multi-page Markdown + generated sidebar + history
- workflow template + regenerate endpoint untuk GitHub Actions

Constraint utama:

- UI contracts harus jelas, tetapi implementasi UI tidak menjadi fokus change ini.
- Source code tidak boleh dieksekusi.
- PAT tidak boleh ditampilkan kembali atau dicatat ke log.
- ZIP upload dibatasi 50MB.
- Temporary storage harus dibersihkan setelah success/failure dengan fallback TTL 30 menit.

## Goals / Non-Goals

**Goals:**

- Menyediakan backend auth/session yang cukup untuk mengaitkan user, project, PAT, docs, dan regenerate actions.
- Menyediakan backend create project dan source intake dari ZIP atau GitHub URL.
- Menyediakan akses private repo yang aman melalui encrypted PAT per user.
- Menyediakan pipeline backend: ingestion → analysis → AI docs generation → docs persistence.
- Menyediakan generated docs dalam bentuk multi-page Markdown, sidebar metadata, current-doc overwrite, dan docs history.
- Menyediakan data dan indexing pipeline awal untuk semantic codebase search.
- Menyediakan regenerate endpoint yang dapat dipanggil dari workflow GitHub Actions.

**Non-Goals:**

- Implementasi UI detail seperti visual design, page composition, dan polished interactions.
- Realtime collaboration.
- Versioning system dokumentasi yang kompleks.
- Multi-provider AI switching beyond OpenAI-compatible contract.
- Production-grade distributed worker/queue architecture.

## Decisions

### 1. Backend tetap satu stack dengan Next.js API Routes

**Decision:** Gunakan Next.js API Routes / Node.js sebagai backend MVP.

**Why:** Meminimalkan overhead project split dan mempercepat hackathon delivery. Web dan backend bisa tetap satu ekosistem, tetapi folder `apps/api` tetap menjadi boundary logis untuk service code.

**Alternative considered:** Backend terpisah dengan Express/NestJS. Ditolak karena menambah setup dan tidak dibutuhkan untuk MVP.

### 2. GitHub import memakai `git clone`, bukan GitHub API parsing

**Decision:** Public/private repository diambil dengan `git clone`.

**Why:** Struktur source yang didapat lebih dekat ke folder lokal dan cocok untuk analyzer berbasis filesystem.

**Alternative considered:** GitHub API adapter. Ditolak untuk MVP karena akan menambah kompleksitas request tree/file-by-file.

### 3. PAT disimpan terenkripsi per user untuk reuse

**Decision:** PAT disimpan di encrypted file storage per user dan hanya user pemilik yang dapat revoke/delete.

**Why:** PAT diperlukan kembali untuk regenerate docs atau clone ulang private repository. Penyimpanan per user menjaga ownership boundary.

**Alternative considered:** PAT hanya in-memory per request. Ditolak karena mempersulit regenerate dan automation flow.

### 4. Temporary source storage bersifat ephemeral

**Decision:** ZIP/extracted files/cloned repos disimpan sementara di `/tmp` atau storage ephemeral setara, dengan cleanup setelah success/failure dan fallback TTL 30 menit.

**Why:** Source hanya dibutuhkan selama ingestion dan analysis. Penyimpanan persisten untuk raw source bukan prioritas MVP dan menambah risiko keamanan.

**Alternative considered:** Persistent object storage untuk raw source. Ditolak untuk hackathon karena lebih kompleks.

### 5. Analyzer menggunakan hybrid approach (deterministic + agent enrichment)

**Decision:** Codebase analysis menggunakan two-phase approach:
1. **Deterministic scan** - fast baseline scan untuk file tree, config files, dependencies
2. **Agent enrichment** - intelligent inference untuk tech stack, prioritization, compact context generation

**Why:** 
- Deterministic scan cepat dan murah untuk baseline data
- Agent enrichment fokus pada inference (bukan exploration), lebih cost-effective
- Fallback ke raw scan jika agent fail
- Balance antara speed, cost, dan intelligent analysis

**Alternative considered:** 
- Full agent-driven exploration (Option A) - ditolak karena expensive dan slower untuk MVP
- Pure deterministic + single AI call (Option C) - ditolak karena kurang adaptive dan no parallel execution

### 6. Analyzer mengirim compact context, bukan entire source

**Decision:** Analyzer memakai exclude filter, dependency parsing, tech stack detection, file importance selection, dan chunking untuk membangun compact AI context (max 2000 tokens).

**Why:** Menekan token usage, cost, dan risiko kebocoran data yang tidak relevan.

**Alternative considered:** Mengirim seluruh source ke AI. Ditolak karena mahal, lambat, dan berisiko.

### 7. Generated docs disimpan sebagai current docs + history

**Decision:** Output docs disimpan dalam format multi-page Markdown dengan generated sidebar metadata. Regenerate akan overwrite current docs, tetapi history generation tetap disimpan.

**Why:** Sesuai kebutuhan GitBook-like output dan memungkinkan audit/regenerate tanpa menyimpan semua source raw.

**Alternative considered:** Single-page Markdown tanpa history. Ditolak karena kurang cocok untuk navigasi dan perkembangan produk.

### 8. Semantic search dipersiapkan di backend, chat bisa staged

**Decision:** Backend menyiapkan vector/embedding index dari generated docs dan codebase summary. AI chat boleh hadir setelah flow docs generation stabil, tetapi data layer semantic search disiapkan dari awal.

**Why:** Chatbot yang relevan membutuhkan retrieval layer. Menyiapkan index lebih awal menghindari refactor besar.

**Alternative considered:** Chat tanpa retrieval. Ditolak karena kualitas jawaban akan lemah.

### 9. GitHub Actions cukup workflow template + regenerate endpoint

**Decision:** Automation memakai workflow template yang memanggil regenerate endpoint backend.

**Why:** Ini cukup untuk hackathon dan lebih sederhana daripada full webhook orchestration yang kompleks.

**Alternative considered:** Full webhook + event orchestration. Ditolak untuk MVP.

## Risks / Trade-offs

- **PAT encrypted storage menambah kompleksitas operasional** → Gunakan file-per-user dengan ownership rule, encryption helper, dan revoke/delete endpoint yang eksplisit.
- **Next.js API routes kurang ideal untuk long-running jobs** → Batasi ukuran ZIP, job scope, dan gunakan background task sederhana untuk MVP.
- **Generated docs history menambah storage kebutuhan** → Simpan history metadata dan hasil docs saja, bukan raw source.
- **Semantic search menambah dependency embeddings/index** → Stage implementation setelah docs generation stabil; definisikan contract lebih awal.
- **GitHub Actions dapat memperlebar scope** → Batasi ke regenerate endpoint + workflow template, bukan full sync platform.

## Migration Plan

1. Tambahkan backend auth/session contract dan project ownership model.
2. Tambahkan source intake endpoints (ZIP/GitHub URL/PAT).
3. Tambahkan encrypted PAT storage dan private repo access flow.
4. Tambahkan temporary source storage, cleanup policy, dan job lifecycle.
5. Tambahkan analyzer pipeline dan compact context builder.
6. Tambahkan AI documentation generation, page splitting, sidebar generation, dan docs persistence.
7. Tambahkan docs history dan regenerate endpoint.
8. Tambahkan semantic index build contract untuk future AI chat.

Rollback strategy untuk hackathon bersifat sederhana: disable source ingestion mode atau regenerate endpoint yang bermasalah dan fallback ke ZIP-only/public-repo-only flow.

## Open Questions

- Format file terenkripsi untuk PAT per user: satu file per provider/project atau satu vault per user?
- Di mana docs history dan vector index disimpan pada MVP: file storage, lightweight DB, atau hybrid?
- Apakah create project perlu langsung membuat scaffold metadata kosong sebelum source ingestion berhasil?
- Seberapa jauh auth perlu mengatur role/ownership pada tahap MVP?
