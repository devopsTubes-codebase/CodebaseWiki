# Codebase Analysis Architecture

## Overview

Codebase analysis menggunakan **hybrid approach** dengan two-phase execution:
1. **Deterministic scan** - fast, cheap baseline data extraction
2. **Agent enrichment** - intelligent inference and prioritization

## Architecture Diagram

```
Source Code (temp storage)
        ↓
┌───────────────────────────────────────┐
│   Codebase Analysis Service           │
├───────────────────────────────────────┤
│                                       │
│  Phase 1: Deterministic Scan          │
│  ┌─────────────────────────────────┐  │
│  │ - File tree traversal           │  │
│  │ - Config file detection         │  │
│  │ - Dependency extraction         │  │
│  │ - Exclude filter application    │  │
│  └─────────────────────────────────┘  │
│           ↓                           │
│      Raw Scan Data                    │
│           ↓                           │
│  Phase 2: Agent Enrichment            │
│  ┌─────────────────────────────────┐  │
│  │ Spawn enrichment agent with:    │  │
│  │ - [CONTEXT] Raw scan results    │  │
│  │ - [GOAL] Intelligent analysis   │  │
│  │ - [DOWNSTREAM] AI doc gen       │  │
│  │ - [REQUEST] Inference tasks     │  │
│  └─────────────────────────────────┘  │
│           ↓                           │
│   Enriched Analysis                   │
│   ┌─────────────────────────────┐    │
│   │ - Tech stack inference      │    │
│   │ - Important file priority   │    │
│   │ - Compact context (≤2000t)  │    │
│   │ - Suggested doc structure   │    │
│   └─────────────────────────────┘    │
│           ↓                           │
│   Fallback on agent failure           │
│   (return raw scan + defaults)        │
│                                       │
└───────────────────────────────────────┘
        ↓
Complete Analysis Result
```

## Module Structure

```
apps/api/services/codebase-analysis/
├── index.ts                        # Main service orchestrator
├── deterministic-scanner.ts        # Phase 1: Fast baseline scan
│   ├── scanFileTree()
│   ├── detectConfigFiles()
│   ├── extractDependencies()
│   └── applyExcludeFilter()
├── config-detector.ts              # Config file detection logic
│   ├── detectPackageJson()
│   ├── detectTsConfig()
│   ├── detectRequirementsTxt()
│   ├── detectGoMod()
│   └── detectOtherConfigs()
├── dependency-extractor.ts         # Parse dependencies from configs
│   ├── extractNpmDeps()
│   ├── extractPipDeps()
│   ├── extractGoDeps()
│   └── extractOtherDeps()
├── agent-enricher.ts               # Phase 2: Agent enrichment
│   ├── spawnEnrichmentAgent()
│   ├── buildEnrichmentPrompt()
│   └── handleAgentFailure()
├── compact-context-builder.ts      # Build AI-ready context
│   ├── buildCompactContext()
│   ├── prioritizeFiles()
│   └── enforceTokenLimit()
└── types.ts                        # TypeScript types
```

## Data Flow

### Phase 1: Deterministic Scan

**Input:**
- `tempStoragePath: string` - Path to extracted/cloned source

**Process:**
1. Traverse file tree (recursive)
2. Apply exclude filter (node_modules, .git, dist, build, etc.)
3. Detect config files (package.json, tsconfig.json, requirements.txt, etc.)
4. Extract dependencies from config files
5. Build folder structure metadata

**Output:**
```typescript
interface RawScanResult {
  projectId: string;
  fileCount: number;
  folderStructure: string[];
  configFiles: Array<{
    path: string;
    type: 'package.json' | 'tsconfig.json' | 'requirements.txt' | 'go.mod' | 'other';
  }>;
  dependencies: Record<string, string>; // name -> version
  excludedPaths: string[];
  scanDuration: number; // ms
}
```

### Phase 2: Agent Enrichment

**Input:**
- `rawScan: RawScanResult`

**Process:**
1. Build structured prompt with [CONTEXT] + [GOAL] + [DOWNSTREAM] + [REQUEST]
2. Spawn enrichment agent (background task)
3. Wait for agent completion (with timeout)
4. Parse agent response
5. Fallback to defaults on failure

**Prompt Structure:**
```
[CONTEXT]
Raw codebase scan completed for project {projectId}.
Found {fileCount} files, {configFiles.length} config files.
Detected dependencies: {dependencies}

[GOAL]
Enrich raw scan with intelligent analysis for documentation generation.

[DOWNSTREAM]
Results will feed into AI doc generation prompt to determine:
- Documentation structure and sections
- Important files to highlight
- Tech stack context for documentation tone

[REQUEST]
Based on raw scan data, provide:
1. Inferred tech stack (frameworks, languages, tools)
2. Prioritized important files for documentation focus
3. Compact context summary (max 2000 tokens for AI doc generation)
4. Suggested documentation structure based on project type

Raw scan data:
{JSON.stringify(rawScan, null, 2)}

Return format (JSON):
{
  "techStack": ["framework1", "language1", "tool1"],
  "importantFiles": ["path1", "path2", "path3"],
  "compactContext": "summary text...",
  "suggestedDocStructure": ["Getting Started", "Architecture", "API Reference"]
}
```

**Output:**
```typescript
interface EnrichedAnalysis {
  techStack: string[];
  importantFiles: string[];
  compactContext: string; // max 2000 tokens
  suggestedDocStructure: string[];
  enrichmentDuration: number; // ms
  agentUsed: boolean; // false if fallback
}
```

### Combined Result

```typescript
interface CodebaseAnalysis {
  projectId: string;
  // From deterministic scan
  fileCount: number;
  folderStructure: string[];
  configFiles: Array<{ path: string; type: string }>;
  dependencies: Record<string, string>;
  excludedPaths: string[];
  // From agent enrichment
  techStack: string[];
  importantFiles: string[];
  compactContext: string;
  suggestedDocStructure: string[];
  // Metadata
  scanDuration: number;
  enrichmentDuration: number;
  agentUsed: boolean;
  completedAt: string; // ISO timestamp
}
```

## Agent Enrichment Details

### Agent Configuration

```typescript
const enrichmentAgent = await spawnAgent({
  type: 'explore', // or custom 'codebase-enricher' agent
  background: true,
  timeout: 60000, // 60s timeout
  prompt: buildEnrichmentPrompt(rawScan)
});
```

### Fallback Strategy

**Trigger fallback when:**
- Agent spawn fails
- Agent timeout (>60s)
- Agent returns invalid JSON
- Agent returns incomplete data

**Fallback behavior:**
```typescript
function fallbackEnrichment(rawScan: RawScanResult): EnrichedAnalysis {
  return {
    techStack: inferTechStackFromConfigs(rawScan.configFiles),
    importantFiles: defaultImportantFiles(rawScan.folderStructure),
    compactContext: buildBasicContext(rawScan),
    suggestedDocStructure: ['Overview', 'Getting Started', 'Reference'],
    enrichmentDuration: 0,
    agentUsed: false
  };
}
```

## Performance Characteristics

| Phase | Duration | Cost | Reliability |
|-------|----------|------|-------------|
| Deterministic scan | ~100-500ms | Free | 100% |
| Agent enrichment | ~10-60s | ~$0.01-0.05 | 95% (with fallback) |
| **Total** | ~10-60s | ~$0.01-0.05 | 100% (with fallback) |

## Error Handling

### Deterministic Scan Errors
- File read permission denied → Skip file, log warning
- Invalid config file format → Skip parsing, log warning
- Disk space full → Fail analysis, return error

### Agent Enrichment Errors
- Agent spawn failure → Use fallback
- Agent timeout → Use fallback
- Invalid agent response → Use fallback
- Agent returns partial data → Merge with fallback defaults

## Security Considerations

1. **No code execution** - Only read files, never execute
2. **Exclude sensitive files** - .env, credentials, private keys
3. **Token limit enforcement** - Compact context max 2000 tokens
4. **Agent prompt sanitization** - Escape special characters in raw scan data
5. **Temporary storage cleanup** - Delete after analysis complete

## Future Enhancements (Out of Scope for MVP)

- Full agent-driven exploration (Option A) for adaptive analysis
- Multi-language specific analyzers (Python, Go, Java, etc.)
- Incremental analysis (only changed files)
- Caching analysis results for regenerate
- Custom exclude patterns per project
