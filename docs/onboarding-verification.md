# Onboarding 2.0 — verification record (APP-011)

Verified against `finbot-api` handoff freeze `674392d` (branch
`feature/onboarding2.0`); contract generated from
`finbot-api/openapi/openapi.json` via `npm run generate:api`.

## Verified in this pass

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Clean (typed routes regenerated; no handwritten DTOs) |
| `npm run lint` (eslint 9 / expo config) | Clean |
| `npx expo export --platform web` | Bundles all routes: auth, onboarding, connect-bank, processing (waiting/review/retry), app |
| Generated client types compile against the handoff OpenAPI | Yes — every request/response type extracted from `types.gen.ts` |
| Route matrix vs handoff `state-route-matrix.md` | Implemented in `src/features/onboarding-status/routing.ts` (single decision function; account + connections stay reachable while restricted) |
| Error envelope handling | `ApiError.code` + `isApiErrorCode`; stale-version and unresolved-items paths handled in the review screen |
| Backend flow end-to-end | Covered API-side: `finbot-api/tests/e2e.pipeline.test.ts` runs the full link→sync→classify→reconcile→recur→facts→review→correct→confirm flow against real Postgres |

## Requires a device / real Sandbox session (not runnable in this pass)

These need `docker compose up` with real Plaid Sandbox credentials plus a
development build (`npx expo run:ios` / `run:android`) or the web browser:

1. **Web Hosted Link:** connect Sandbox institution via the hosted tab, add a
   second institution, declare done.
2. **Native Link + OAuth:** dev build on device; OAuth institutions need
   `PLAID_REDIRECT_URI` registered (Sandbox works without).
3. **Multi-Item:** two institutions with independent sync timing → waiting
   milestones show per-institution progress.
4. **Delayed push:** set `ANALYSIS_EXPECTED_WINDOW_SECONDS=0`, background the
   app during analysis, receive `financial_review_ready`, tap → review.
   Simulators do not receive push; physical device required.
5. **Retries:** break a Sandbox Item (`/sandbox/item/reset_login`) → ITEM
   error → failed state → reconnect via update-mode Link → retry.
6. **Corrections & final gate:** accept/answer required review items, confirm,
   land in the main app; relaunch stays in the main app.

Failures found in device verification belong in the owning ticket/repository —
fix the API or feature, do not patch around it in UI.

## Known limitations

- `use-connect-bank.ts` (single-connection hook) is superseded by
  `use-linking-hub.ts`; the old hook remains only for reference and is unused.
- Update-mode Hosted Link on web cannot report completion; the hub treats a
  closed tab as done and re-checks connection health.
- Expo push requires a development build; Expo Go and web fall back to
  status polling (by design).
