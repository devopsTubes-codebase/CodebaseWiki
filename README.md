# Refactory Hackathon

Repository untuk hackathon tim yang berfokus pada produk dokumentasi otomatis berbasis agent.

## Tujuan project

Project ini diarahkan untuk membuat produk seperti GitBook, tetapi isi dokumentasinya dibantu oleh agent:
- user memberikan konteks atau bahan awal
- agent memahami tujuan/proyek
- agent menyusun struktur dan isi dokumentasi
- hasil akhirnya dipublish ke web docs

## Struktur folder

```text
hackathon/
├─ .opencode/                # OpenCode commands, skills, memory
├─ openspec/                 # Proposal, specs, tasks, change history
├─ docs/                     # Dokumen produk dan teknis
│  ├─ prd/                   # Product Requirement Document
│  ├─ architecture/         # Arsitektur sistem
│  │  ├─ c4/                # C4 model
│  │  ├─ diagrams/          # Diagram lain
│  │  └─ decisions/         # Keputusan teknis / ADR
│  ├─ content/              # Aturan dan struktur konten docs
│  │  ├─ structure/
│  │  ├─ templates/
│  │  └─ writing-guidelines/
│  └─ research/             # Riset produk / kompetitor / referensi
├─ apps/                     # Aplikasi yang dibangun
│  ├─ web/                   # Web docs / front-end
│  └─ api/                   # Backend / orchestrator
├─ workflows/                # Alur kerja agent dan prompt chain
│  ├─ agent-pipelines/
│  └─ prompts/
├─ experiments/              # Eksperimen cepat / proof of concept
└─ README.md
```

## Fungsi tiap folder

### `.opencode/`
Setup OpenCode untuk command, skills, dan workflow bantuan AI.

### `openspec/`
Pusat handoff kerja: proposal, design, tasks, dan perubahan yang sedang dikerjakan.

### `docs/`
Semua dokumen resmi project.

### `apps/`
Kode aplikasi yang akan dipakai user.

### `workflows/`
Tempat mendefinisikan alur delegasi agent, prompt, dan pipeline kerja.

### `experiments/`
Area coba-coba yang belum final.

## Pembagian fokus tim

- **Kamu**: implementasi di `apps/`, integrasi workflow di `workflows/`
- **Anggota 2**: `docs/prd/`
- **Anggota 3**: `docs/architecture/`
- **Anggota 4**: `docs/content/` dan `docs/research/`

## Aturan kerja

- Gunakan `openspec/` untuk tracking change dan task.
- Simpan keputusan produk dan arsitektur di `docs/`.
- Simpan eksperimen cepat di `experiments/`.
- Jangan mencampur dokumen final dengan trial cepat.

## CI dan deploy

- `push` dan `pull_request` menjalankan CI di `.github/workflows/ci.yml`.
- `push` ke `main` atau `master` memicu deploy ke namespace `wiki-team` lewat `.github/workflows/deploy.yml`.
- Secret runtime untuk deploy diambil dari GitHub Secrets, termasuk `DATABASE_URL`, `KUBE_CONFIG_DATA`, `OPENAI_API_KEY`, `NEXTAUTH_SECRET`, `ENCRYPTION_SECRET_KEY`, dan `DOCKERHUB_TOKEN`.

## Deploy manual

- Jalankan `scripts/manual-deploy.sh` untuk build image, push ke DockerHub, lalu apply ke cluster `wiki-team`.
- Script otomatis membaca `.env.local`, `.env.deploy.local`, `wiki-team/db-credentials.txt`, `wiki-team/domain.txt`, dan `wiki-team/kubeconfig.yaml`.
- Simpan secret deploy di `.env.deploy.local` supaya tidak ikut ke git; kamu bisa menyalin formatnya dari `.env.deploy.example`.
- Username DockerHub default sekarang `hshinosa`; override hanya kalau memang perlu.
- `DOCKERHUB_TOKEN` opsional kalau kamu belum login ke DockerHub di mesin ini; kalau sudah login, script akan pakai credential yang ada.
- `IMAGE_TAG` bisa diisi kalau kamu tidak mau pakai `latest`.
