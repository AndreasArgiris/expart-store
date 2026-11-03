# My React + TypeScript guidelines

Apply these to this project, including when I just say "create a page" or "add a component", without me repeating them.

## Stack

- **Main stack:** React + TypeScript
- **Data management:** TanStack Query. Wrap every query and mutation in a custom hook inside its feature folder (e.g. `features/cart/useCart.ts`), with query keys defined once as constants.
- **Styling:** Tailwind CSS. Define colors, spacing and fonts once in the Tailwind theme and use those classes, with no hardcoded hex values or repeated arbitrary values.
- **Animations:** Framer Motion (the `framer-motion` package already installed here). Shared animation variants and durations are defined once and reused.
- **Testing:** Vitest + React Testing Library

**Not set up yet in this project:** the existing code still uses Bootstrap + plain CSS (`src/index.css`, `src/shop.css`), and Tailwind, TanStack Query and Vitest are not installed. Ask me before installing them or migrating existing code.

## Code rules

1. **One job per function.** Each component or function does one thing and has a name that says what it does.
2. **Keep components small.** Aim for 100–150 lines at most, and split anything bigger into smaller components or hooks.
3. **Put logic in custom hooks.** Fetching, state and reusable stateful logic go in `useSomething()` hooks, so components only render UI and the logic can be tested on its own.
4. **Use clear names.** PascalCase for components, `useX` for hooks, `handleX` for event handlers, `onX` for callback props, and `isX`/`hasX` for booleans.
5. **Don't store what you can calculate.** Compute derived values during render instead of keeping them in extra state.
6. **Use `useEffect` only for outside systems.** That means timers, subscriptions and DOM APIs (data fetching goes through TanStack Query). Logic triggered by a user action goes in its event handler, and derived data is computed during render.
7. **Organize folders by feature.** For example `features/cart/` and `features/auth/`, each holding its own components, hooks, types and tests. Only code that several features really share goes in `shared/`.
8. **No duplicated code or magic values.** Logic used in more than one place becomes a shared function, component or hook. Hardcoded values used more than once (colors, spacing, breakpoints, URLs, text, limits) are defined once as constants or Tailwind theme tokens and imported everywhere.
9. **Type everything strictly.** Turn on `strict` in `tsconfig.json`, never use `any` or unchecked `as` casts, type props with an explicit `interface` or `type`, and validate external data (API responses, forms) at runtime.
10. **Automate quality.** New projects get a linter, a formatter, type-checking and tests (Vitest + React Testing Library, testing behavior rather than implementation), run in pre-commit hooks and CI so the standards hold without anyone having to remember them.

## Before you finish any task

1. Run `npm run check` (type-check + oxlint). Fix every error, and fix every warning in the files you created or changed.
2. Re-read the code you wrote against the rules above, especially the ones the linter can't check: naming (rule 4), one job per function (rule 1), folders by feature (rule 7) and no duplicated code (rule 8).
3. Never silence a rule (no `oxlint-disable` comments, no loosening `.oxlintrc.json`) without asking me first.
