## Why

Codebase Wiki sudah memiliki PRD, ADR, dan C4 model, tetapi belum ada perubahan OpenSpec yang memecah MVP menjadi backend-first execution plan. Tim UI sedang dikerjakan secara paralel oleh desainer, jadi backend perlu menjadi fondasi utama untuk source ingestion, analisis codebase, AI documentation generation, dan data contracts yang nanti dikonsumsi UI.

## What Changes

- Menambahkan backend MVP untuk intake source project dari ZIP atau GitHub repository URL.
- Menambahkan dukungan private repository melalui GitHub PAT yang disimpan terenkripsi per user.
- Menambahkan pipeline backend untuk clone/extract source, analisis struktur project, dan deteksi dependency/tech stack.
- Menambahkan AI documentation generation yang menghasilkan multi-page Markdown docs, generated sidebar, current docs overwrite, dan docs history.
- Menambahkan semantic search preparation untuk AI chat melalui vector/embedding index dari codebase summary dan generated docs.
- Menambahkan backend regenerate endpoint yang dapat dipanggil dari workflow GitHub Actions.
- Menetapkan contract backend untuk auth/session, create project, job lifecycle, error handling, dan cleanup temporary storage.

## Capabilities

### New Capabilities
- `backend-auth-session`: backend authentication/session handling dengan NextAuth/Auth.js untuk mengaitkan project, PAT, dan generated docs ke user.
- `project-intake`: backend create project dan penerimaan source project melalui ZIP upload atau GitHub URL.
- `private-repo-access`: akses private repository menggunakan encrypted PAT per user untuk clone dan regenerate docs.
- `source-ingestion`: extract ZIP atau clone repository ke temporary source storage dengan cleanup policy.
- `codebase-analysis`: scan folder structure, dependency, file penting, exclude filter, dan tech stack detection.
- `ai-doc-generation`: generate multi-page Markdown docs, generated sidebar, dan docs history dari codebase summary.
- `semantic-search-prep`: bangun vector/embedding index dari generated docs dan codebase summary untuk AI chat.
- `regenerate-docs-endpoint`: endpoint backend untuk trigger regenerate docs, termasuk integrasi workflow GitHub Actions.

### Modified Capabilities

- None.

## Impact

- Affected code: `apps/api/` sebagai area implementasi utama backend; `apps/web/` hanya terkena contract API/output shape.
- Affected APIs: auth/session, create project, source input, job status, generate docs, docs retrieval, regenerate docs, chat context/search.
- Dependencies: NextAuth/Auth.js, upload/ZIP extraction library, git clone adapter, OpenAI-compatible API client, Markdown renderer/output formatter, encryption utility untuk PAT, vector/embedding storage/index.
- Systems: GitHub, GitHub Actions, OpenAI-compatible AI provider, temporary source storage, documentation store, PAT store, vector index store.
