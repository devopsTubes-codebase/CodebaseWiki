# C4 Model Template

Gunakan template ini untuk mendokumentasikan arsitektur dengan level C4.

## C1 - System Context

Jelaskan sistem sebagai satu kesatuan dan relasinya dengan aktor/sistem lain.

### Actors

- User:
- Team/Admin:
- External service:

### Context Diagram

```text
[User] -> [Documentation Automation Platform] -> [Generated Docs Web]
```

## C2 - Container

Jelaskan container utama dalam sistem.

```text
[Web App] -> [API / Orchestrator] -> [Agent Workflow]
                         |
                         v
                    [Storage]
```

### Containers

- Web app:
- API/orchestrator:
- Agent workflow:
- Storage:

## C3 - Component

Jelaskan komponen penting di dalam container.

### API / Orchestrator Components

- Ingestion:
- Context analyzer:
- Documentation generator:
- Publishing service:

## C4 - Code

Isi hanya kalau struktur kode sudah cukup stabil.

## Open Questions

- Question 1:
- Question 2:
