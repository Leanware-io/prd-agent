# PRD Agent — Frontend

React 18 + TypeScript single-page app built with Vite and Tailwind, deployed to
Firebase Hosting. Provides the chat interface, Firebase authentication, and the
quote artifact viewer.

See the [root README](../README.md) for the overall architecture and setup across
both packages. This file covers frontend specifics only.

## Quick start

```bash
yarn install
cp .env-sample .env                 # then fill it in
yarn dev
```

Every variable is read through `src/shared/config/environment.ts`. Vite inlines
anything prefixed `VITE_` into the client bundle, so treat all of them as public
and never put a server-side secret behind that prefix.

## Architecture

The codebase follows [Feature-Sliced Design](https://feature-sliced.design/):

```
src/app/        entrypoint, providers (user, toast, dropzone, gtag), global styles
src/pages/      route-level screens
src/widgets/    composed blocks — authentication, chat interface, hero form, background
src/features/   chat feature slices — input, message, recorder, files, quote artifact
src/shared/     api clients, config, ui kit, lib, routes, utils
```

A layer may only import from layers **below** it, and each slice exposes its
public API through an `index.ts` barrel — import from the slice root
(`@/features/chat`) rather than a path inside it. `yarn check-structure`
(steiger) and `yarn check-circular` (madge) enforce this.

See [DEPENDENCIES.md](DEPENDENCIES.md) for notes on the main dependencies.

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn dev` | Vite dev server |
| `yarn build` | Type-check then production build |
| `yarn ci` | Circular deps, types, ESLint, Stylelint, tests with coverage |
| `yarn test` | Jest — `yarn test:watch` to watch |
| `yarn lint` | ESLint with `--fix` |
| `yarn lint:css` | Stylelint with `--fix` |
| `yarn check-types` | `tsc --noEmit` |
| `yarn format` | Prettier |

`scripts/code-quality.sh` (and `.bat`) bundle the checks.

## Conventions

- Imports are auto-sorted by `eslint-plugin-sort-imports-es6-autofix`; interface
  and enum keys are alphabetised by `eslint-plugin-typescript-sort-keys`. Let the
  linter order them.
- Prettier uses `trailingComma: "all"`.
- Tailwind for styling, with CSS Modules only where Tailwind falls short.
- Jest + React Testing Library. Non-JS assets and heavy dependencies (`three`,
  `react-markdown`, `react-resizable-panels`) are mocked in `__mocks__/` — add a
  mock there when introducing a similar dependency.

## Deployment

`firebase.json` defines `staging` and `production` hosting targets. Those targets
are bound to real Firebase sites at deploy time by the workflows in the
repository root [`.github/workflows/`](../.github/workflows), using repository
Variables — there is deliberately no committed `.firebaserc`, so no project or
site IDs live in this repository.
