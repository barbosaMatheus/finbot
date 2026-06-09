# QWEN3 Markdown

## Project Overview

This is a TypeScript React application built with Expo and EAS.

Primary goals:

- Maintainable architecture
- Strong type safety
- Minimal technical debt
- Offline-first functionality where possible
- Local LLM integration support
- Production-quality code

When generating code, prioritize maintainability and correctness over brevity.

---

# General Rules

## TypeScript

Always:

- Use TypeScript strict mode patterns
- Avoid `any`
- Prefer explicit types over inference when it improves readability
- Use interfaces for public contracts
- Use type aliases for unions and utility types

Never:

- Use `@ts-ignore`
- Disable lint rules without explanation
- Introduce unnecessary type assertions

---

## React-Native

Prefer:

- Functional components
- Hooks
- Composition over inheritance
- Small focused components

Avoid:

- Large components (>300 lines)
- Deep prop drilling
- Complex useEffect chains

If state becomes complex:

- Extract custom hooks
- Consider context or dedicated state management

---

# State Management

Prefer:

1. Local component state
2. Custom hooks
3. Context

Avoid introducing global state unless necessary.

Do not add Redux, MobX, Zustand, or other state libraries without justification.

---

# Error Handling

Never swallow exceptions.

Use:

- Typed error objects
- User-friendly messages
- Logging for diagnostics

All async operations should have proper error handling.

---

# Performance

Consider:

- Memoization only when needed
- Lazy loading for expensive screens
- Virtualized lists for large datasets

Do not prematurely optimize.

Measure first.

---

# Dependencies

Before adding a dependency:

1. Check if existing code can solve the problem.
2. Check if the dependency is actively maintained.
3. Check bundle size impact.

Avoid introducing dependencies for trivial functionality.

---

# Testing

When creating tests:

Prefer:

- Behavior-focused tests
- Integration tests for workflows
- Mock external services

Avoid:

- Testing implementation details
- Snapshot-heavy testing

---

# Security

Never:

- Store API keys in source code
- Commit secrets
- Log sensitive user data

Validate:

- User input
- LLM output
- Network responses

---

# Database Rules

If local storage is required:

Prefer:

1. SQLite
2. Structured repositories
3. Typed models

Avoid direct SQL usage from UI components.

Use repository abstractions.

---

# Code Generation Instructions

When modifying existing code:

1. Read surrounding files first.
2. Preserve existing patterns.
3. Minimize changes.
4. Explain architectural decisions.
5. Do not rewrite working code unnecessarily.

When proposing changes:

Provide:

- Rationale
- Tradeoffs
- Risks

Prefer incremental improvements over large rewrites.

---

# Refactoring Rules

Good refactors:

- Reduce complexity
- Improve naming
- Improve separation of concerns
- Increase testability

Bad refactors:

- Large rewrites with no measurable benefit
- Style-only changes
- Unnecessary abstractions

---

# Documentation

Public functions should include concise documentation.

Complex logic should include explanatory comments.

Avoid obvious comments.

Bad:

// Increment count
count++;

Good:

// Maintain ordering required by vector search ranking.
results.sort(compareScore);

---

# Agent Behavior

When uncertain:

- Ask clarifying questions.
- Do not invent APIs.
- Do not invent library capabilities.
- Do not fabricate file contents.

If requirements conflict:

- Explain the conflict.
- Recommend alternatives.
- Wait for direction when necessary.

Favor correctness over confidence.
