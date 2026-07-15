# FinBot (Expo / React Native)

## Expo docs (required)

Expo APIs change between SDK versions. This app uses **Expo SDK 56**.

Before writing Expo/RN code, read the versioned docs: https://docs.expo.dev/versions/v56.0.0/

Prefer Expo SDK modules and React Native built-ins over third-party packages.

## Avoid deprecated functionality

- Do **not** use deprecated APIs, props, hooks, modules, or patterns from Expo, React Native, React, Expo Router, or any dependency.
- Before adopting an API, confirm it is current for **Expo SDK 56** / the installed package version (versioned Expo docs, React Native docs, or the library’s current docs). Prefer the recommended replacement when docs mark something as deprecated or legacy.
- Do not copy outdated snippets (class components, old React Navigation patterns when Expo Router applies, removed RN APIs, legacy Expo modules, etc.).
- When refactoring or touching existing code that uses a deprecated API, migrate it to the supported replacement rather than extending the deprecated usage.
- If unsure whether something is deprecated, check the SDK 56 docs (or package changelog) and choose the non-deprecated path.

## Stack

- Expo SDK 56 + Expo Router (file-based routing under `src/app`)
- React 19 + React Native
- TypeScript (`strict: true`)
- Path alias: `@/*` → `src/*`, `@/assets/*` → `assets/*`
- **Zod** for schema definitions and validation
- **React Hook Form** (`react-hook-form` + `@hookform/resolvers`) for form state

## Form validation (required)

- Use **React Hook Form** for all forms (auth, onboarding, settings, etc.).
- Define schemas with **Zod** and wire them via `zodResolver` from `@hookform/resolvers/zod`.
- Prefer `Controller` / `useFormContext` / `FormProvider` for React Native inputs (no native HTML form refs).
- Infer form value types from Zod with `z.infer<typeof schema>` instead of duplicating hand-written form types when possible.
- Validate before submit / step advance with `handleSubmit` or `trigger(fieldNames)`.
- Do not invent ad-hoc validators when Zod + RHF already cover the case. Do not add a second form/validation library.
- Colocate feature schemas under `features/<feature>/schemas/` (or next to the form if tiny).

Example:

```ts
const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
});
```

## Dependencies

- Do **not** install new packages unless absolutely necessary.
- Prefer: Expo modules, React Native core, packages already in `package.json`.
- If a package is required, use only well-known, maintained libraries (Expo, React Native community, widely adopted orgs). Prefer official Expo installs (`npx expo install …`) so versions match the SDK.
- Never add obscure, unmaintained, or low-trust packages.

## Architecture (Bulletproof React, adapted for Expo)

Follow [Bulletproof React](https://github.com/alan2207/bulletproof-react) project structure where it fits Expo Router.

### Top-level `src/`

```text
src/
  app/           # Expo Router routes only (screens + layouts). Keep thin.
  components/    # Shared UI used by 2+ features
  constants/     # Shared constants / theme
  features/      # Feature modules (domain logic + feature UI)
  hooks/         # Shared hooks used by 2+ features
  lib/           # App-wide clients, config, integrations
  types/         # Shared TypeScript types (create when needed)
  utils/         # Shared pure helpers (create when needed)
  stores/        # Shared global state (create when needed)
```

Unidirectional imports only:

```text
shared (components | hooks | lib | types | utils | constants)
  ↑
features
  ↑
app (routes)
```

- `app` may import from `features` and shared modules.
- `features` may import from shared modules only.
- Shared modules must **not** import from `features` or `app`.

### Feature module layout

Each feature under `src/features/<feature-name>/` owns its own colocated folders. Only create folders that are needed:

```text
src/features/<feature>/
  api/           # Feature API calls / request helpers
  components/    # Feature-only components
  constants/     # Feature-only constants
  hooks/         # Feature-only hooks (use*.ts)
  schemas/       # Zod schemas for feature forms / payloads
  stores/        # Feature-only state
  types/         # Feature-only types
  utils/         # Feature-only helpers
```

Import feature files directly (no barrel `index.ts` re-exports unless there is a clear need).

### No cross-feature imports

Features must not import from other features.

If code in one feature is needed by another:

1. Elevate it to a shared layer at the same level as `features/` (or above): `src/components`, `src/hooks`, `src/lib`, `src/utils`, `src/types`, `src/constants`.
2. Or compose features together in `src/app` (routes/layouts), not inside a feature.

Examples:

- ❌ `features/accounts` importing `features/auth/hooks/useAuth`
- ✅ Shared auth session hook/API moved to `src/hooks` / `src/lib`, or consumed from a route that wires both features

Auth UI that is only used by auth screens belongs in `features/auth/components`, not `src/components/auth`.

## File & naming conventions

### Files

- Use **kebab-case** for file names: `auth-field.tsx`, `api-client.ts`, `use-color-scheme.ts`.
- One React component per file. Do not export multiple components from the same file.
- Colocate styles in the same file with `StyleSheet.create` unless sharing requires elevation.
- Platform splits: `component.tsx` + `component.web.tsx` (Expo convention).

### Components

- **PascalCase** component names and default/named exports that match the component: `export function AuthField`.
- File name is the kebab-case form of the component: `AuthField` → `auth-field.tsx`.
- Props: define a local `type` (preferred) or `interface` named `<ComponentName>Props`.

### Hooks

- Hook files and exports must follow the `use*` convention: `useAuth`, `useTheme`.
- File name: `use-auth.ts`, `use-theme.ts`.
- Feature hooks live in `features/<feature>/hooks/`. Shared hooks live in `src/hooks/`.

### Variables & functions

- `camelCase` for variables, functions, and parameters.
- `UPPER_SNAKE_CASE` for true constants / enum-like values when appropriate.
- Prefer named exports for components, hooks, and utilities. Default export is reserved for Expo Router screen/layout files in `src/app`.

### Types

- Prefer `type` for props, unions, and most shapes; use `interface` when declaration merging or clear object extension is needed.
- Colocate feature types under `features/<feature>/types/`.
- Share cross-feature types in `src/types/`.
- Avoid `any`. Use precise types and generics on API helpers.

## React Native / Expo practices

- Use functional components only.
- Screens in `src/app` should stay thin: wire navigation, call feature hooks, render feature/shared components.
- Use `expo-router` for navigation (`Stack`, `Tabs`, `Link`, `router`, `useSegments`, etc.).
- Prefer `StyleSheet.create` and theme tokens from `src/constants` / shared hooks over inline magic values.
- Respect safe areas, platform differences, and accessibility (`accessibilityLabel`, etc.) where relevant.
- Do not introduce web-only APIs in native paths without a platform file split.

## Code quality expectations

- Match existing patterns in nearby files before inventing new ones.
- Keep changes scoped; do not drive-by refactor unrelated code.
- When elevating shared code out of a feature, update imports and delete the feature-local copy.
- Prefer composing features at the route/layout level over coupling features together.
