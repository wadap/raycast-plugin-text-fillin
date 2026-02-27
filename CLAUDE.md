# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Raycast extension that lets you compose temporary text and paste it into the previously focused app. Two commands: a main editor ("Text Fillin") and a history browser ("Text Fillin History").

## Commands

```bash
npm run dev        # Live development mode with hot reload in Raycast
npm run build      # Production build into dist/
npm run lint       # Lint using Raycast's ESLint config (@raycast/eslint-config)
npm run package    # Build + zip for manual distribution
npm run publish    # Publish to Raycast Store
```

## Architecture

Three source files under `src/`:

- **`history.ts`** — Shared data layer (no React). Exports `HistoryItem` type, `loadHistory()`, `appendHistory()`, and constants (`HISTORY_STORAGE_KEY`, `MAX_HISTORY_ITEMS=50`). All persistence uses Raycast's `LocalStorage`.
- **`text-fillin.tsx`** — Main editor command. Form with TextArea, debounced draft autosave (300ms via `useRef` timer), submit pastes text via `Clipboard.paste()` after `closeMainWindow()`.
- **`text-fillin-history.tsx`** — History browser command. List view with client-side search filtering (`useMemo`), optimistic UI for deletes, `confirmAlert` for destructive "Clear All" action.

Each command is a standalone default-exported React component. They share data only through `history.ts`. No external API calls, no state management library.

## Key Patterns

- **Clipboard-paste flow**: `closeMainWindow()` runs first so Raycast yields focus, then `Clipboard.paste()` lands in the target app.
- **Draft guard**: An `isReady` flag prevents the initial mount from overwriting a persisted draft with an empty string.
- **Optimistic deletes**: History list updates React state immediately, then persists to `LocalStorage` asynchronously.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- **ci.yml** — Runs lint + build on push/PR to main
- **release.yml** — Lint + build + zip + GitHub Release on `v*` tags
- **claude-review.yml** — Automated Claude AI code review on PRs
