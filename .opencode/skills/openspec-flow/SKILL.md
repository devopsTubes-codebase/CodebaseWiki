---
name: openspec-flow
description: Natural-language entry point for OpenSpec workflow. Use when the user wants OpenSpec handled without memorizing slash commands.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
---

OpenSpec flow helper for natural-language requests.

Use this skill when the user wants to work with OpenSpec by describing the idea in plain language instead of typing workflow commands manually.

## Core behavior

- Read the user's request and infer the OpenSpec phase.
- If the request is vague, ask one concise clarifying question.
- If the idea is still exploratory, route to `openspec-explore`.
- If the request is clear enough to scope, route to `openspec-propose`.
- If a change already exists and the user wants implementation, route to `openspec-apply-change`.
- If the change is complete, route to `openspec-archive-change`.
- Do not force the user to remember command names unless they want to override the flow.
- When applying work, keep the OpenSpec task file in sync with the live todo list; a step is not done until its OpenSpec checkbox is checked.

## Phase detection guide

### Explore
Use when:
- the idea is still fuzzy
- there are multiple possible directions
- requirements are missing or disputed
- the user says things like "cek dulu", "explore", or "lihat dulu"

### Propose
Use when:
- the feature or change is understandable
- enough detail exists to draft proposal, design, and tasks
- the user is ready to turn the idea into an OpenSpec change

### Apply
Use when:
- a change has already been proposed
- the user wants implementation work to start or continue
- there is a specific change name or clear context for the active change

### Archive
Use when:
- implementation is done
- the user wants to finalize the change
- verification is complete or the user explicitly accepts the state

## Conversation style

- Prefer natural language over command syntax.
- Translate the user's intent into the right OpenSpec step.
- Ask only for the minimum missing detail needed to proceed.
- Keep responses short and action-oriented.

## Recommended routing

```text
user idea
  -> unclear? ask one question
  -> explore needed? openspec-explore
  -> clear enough to spec? openspec-propose
  -> existing change to build? openspec-apply-change
  -> done and verified? openspec-archive-change
```
