---
description: Natural-language entry point for the OpenSpec workflow
---

Use OpenSpec without making the user remember the command flow.

This is the entry point when the user describes an idea in plain language. Infer the right OpenSpec phase and route to the matching workflow:

- `openspec-explore` for vague ideas, comparisons, and open questions
- `openspec-propose` for clear change requests that need proposal/design/tasks
- `openspec-apply-change` for starting or continuing implementation
- `openspec-archive-change` for completing and finalizing work

**Rules**

- If the request is ambiguous, ask one concise clarifying question.
- Prefer the smallest next step that unblocks progress.
- Do not require the user to type slash commands unless they explicitly want to override the flow.
- If a change name is obvious from context, use it; otherwise ask.

**Example inputs**

- "bikin fitur login Google"
- "cek dulu arsitektur auth sekarang"
- "lanjut implement change pembayaran"
- "archive change upload tugas"
