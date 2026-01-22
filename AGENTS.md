# Repository Agent Guide

This file is for agentic coding tools working in this repo.
It summarizes build/lint/test commands and the local code conventions.

## Quick Facts

- Project: EdgeWeave Frontend (React 19 + Vite 8)
- Package manager: pnpm (Volta pinned)
- Node: 22.14.0 (see `package.json` volta)
- pnpm: 10.6.2 (see `package.json` volta)
- Module type: ESM (`"type": "module"`)

## Commands

- Dev server: `pnpm dev`
- Build (typecheck + bundle): `pnpm build`
- Preview build: `pnpm preview`
- Lint: `pnpm lint`
- Lint with fixes: `pnpm lint:fix`
- Format: `pnpm format`
- Format check: `pnpm format:check`
- Lint + format: `pnpm lint-format`
- Commit helper: `pnpm cz`
- Commit helper (AI): `pnpm cz:ai`
- Commit helper (no verify): `pnpm cz:pass`

## Tests

- No test runner is configured in this repo.
- There is no "run single test" command yet.
- If tests are added later, document single-test commands here.

## Tooling Files

- `package.json` (scripts, deps, Volta pinning)
- `vite.config.ts` (Vite config)
- `.oxlint.json` (Oxlint rules)
- `.oxfmt.json` (Oxfmt rules)
- `.oxfmtignore` (Oxfmt ignore list)
- `tsconfig.json` (project references)
- `tsconfig.app.json` (app TS config)
- `tsconfig.node.json` (node/build TS config)
- `tailwind.config.js` (Tailwind theme, colors, safelist)
- `postcss.config.js` (Tailwind + Autoprefixer)
- `src/styles/globals.css` (CSS variables, theme)

## Cursor / Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Code Style: Formatting

- Oxfmt enforced: 120 print width, 2 spaces, semicolons, double quotes.
- Trailing commas: ES5 style.

## Code Style: TypeScript

- Strict mode enabled (`tsconfig.app.json`).
- `noUnusedLocals` and `noUnusedParameters` are true (typecheck will fail).
- Rely on TypeScript for unused checks.
- Do not use `@ts-ignore` / `@ts-expect-error`.
- Avoid `any`; prefer `unknown` with narrowing or proper types.

## Code Style: Imports

- Use ESM imports.
- Prefer type-only imports for types: `import type { ... }`.
- Use relative imports (no path alias configured).
- Keep imports grouped logically (external first, then local).

## File and Naming Conventions

- Files and folders use `kebab-case` (e.g., `node-management.tsx`).
- React components use `PascalCase` (e.g., `NodeManagement`).
- Hooks and store selectors use `camelCase` (e.g., `useThemeStore`).
- Constants use `UPPER_SNAKE_CASE` only when truly constant.

## React Patterns

- Functional components with hooks.
- Routing is configured via `createBrowserRouter` in `src/main.tsx`.
- App layout lives in `src/App.tsx` with `Outlet` for nested routes.
- Keep route pages in `src/pages/`.

## State Management

- Zustand is the state library (`src/store/`).
- Immer middleware is used for immutable updates.
- Persist middleware is used for localStorage state.
- Store naming pattern: `useXxxStore`.

## API / Data Fetching

- Alova is the data client (`src/lib/api/`).
- Create API methods in `src/lib/api/methods/` using `alovaInstance`.
- Prefer `Record<string, unknown>` for loose payloads and then tighten types.
- Auth uses token in localStorage via `createServerTokenAuthentication`.
- Mocking can be toggled via `VITE_USE_MOCK`.

## Error Handling

- Wrap async handlers in `try/catch`.
- Surface failures with `alert` or `console.error` where appropriate.
- Avoid empty catch blocks.
- Prefer typed errors instead of `any` in catch blocks.

## UI / Styling

- Tailwind CSS is the primary styling system.
- Use `cn()` from `src/lib/utils.ts` to merge class names.
- Theme uses CSS variables in `src/styles/globals.css`.
- Dark mode is a `dark` class on `document.documentElement`.
- Reusable UI primitives live in `src/components/ui/`.

## Comments and Documentation

- Add comments only for non-obvious logic.
- Use Simplified Chinese for comments.
- If you touch a block with English comments, replace with Simplified Chinese.
- Keep file headers consistent when present.

## Build Notes

- `pnpm build` runs `tsc -b` before `vite build`.
- `tsc -b` uses `tsconfig.app.json` and `tsconfig.node.json` references.

## Lint Notes

- Oxlint uses `.oxlint.json` at repo root.

## Formatting Notes

- Use `pnpm format` to apply Oxfmt rules.
- Use `pnpm format:check` in CI-like checks.

## When Adding New Files

- Place new pages in `src/pages/`.
- Place new shared UI in `src/components/ui/`.
- Place new layout components in `src/components/layout/`.
- Place new API methods in `src/lib/api/methods/`.

## When Modifying Existing Files

- Keep the existing code style and structure.
- Do not refactor while fixing bugs.
- Keep changes minimal and focused.
