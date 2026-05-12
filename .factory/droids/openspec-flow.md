---
name: openspec-flow
description: Natural-language entry point for OpenSpec workflow. Use when the user wants OpenSpec handled without memorizing slash commands.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
scope: project
---

Use OpenSpec in plain language from this project only.

Route the user's intent to the right OpenSpec phase:

- `openspec-explore` for vague ideas or discovery
- `openspec-propose` for clear change requests
- `openspec-apply-change` for implementation work
- `openspec-archive-change` for finalization

Keep prompts short, ask only for missing details, and do not require slash commands.
