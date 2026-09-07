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
development build (`npx expo run:ios` / `run:android`) or the web browser.
For Android, `docs/android-build.md` is the build-and-walk procedure; results
of that walk go in the "On a device" section at the end of this file.

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

## On a device

**2026-09-07 — Android Studio emulator (Pixel 7 profile, Android 16 Google
Play image), EAS preview build `18ab3c60` (APK, `com.finbot.finbot`,
versionCode 1), API over the ngrok tunnel, Plaid Sandbox, template
narration.** Driven with adb; two fresh users.

Seen working, in the walk's order: sign-up and sign-in; Plaid Link opening
inside the app (Plaid's own `LinkActivity`, not a browser tab) through
First Platypus Bank's credentials, account list and Sandbox consent, back to
the app with the institution listed and synced within seconds; a second
institution (Tartan Bank) the same way; the system notification prompt and
a registered Android Expo token; the profile steps, the review with its
required item resolved, confirmation, and home showing the first period's
plan; the anchor from the plan card, a target marked done, Got it, and the
time-of-day setting saved from the Account screen; the review-ready push
and the anchor push on the lock screen; the anchor push tapped from the
shade opening the anchor screen, warm and after a background kill; a
force-stop and relaunch still signed in.

Found and fixed in the owning repository:

- The FCM V1 key sat under the pre-rename package (`com.finbotpbd.finbot`),
  so every send came back `InvalidCredentials`; re-assigned on EAS to
  `com.finbot.finbot`. Documented in `android-build.md`.
- Nowhere to turn notifications on after onboarding: the only offer was the
  waiting screen, which a fast analysis skips. The Account screen now
  carries it (app).
- A push arriving while the app was open showed nothing; the app now sets
  a foreground notification handler (app).
- An institution connected from the review's "Connect that card" was never
  folded into the review; the analysis gate now requests a recompute when
  an active Item is newer than the review and every Item has synced (api).

Seen once, not reproduced in three further relaunches: the sign-in screen
after a force-stop relaunch that coincided with a push tap. The refresh
path has no single-flight guard in the app and no reuse detection on the
API; kept on the hardening list.

Not yet done on a device: a physical phone (battery saver, real lock
screen, real network), the top-of-the-hour anchor push from the scheduler
(the walk fired the same send by hand), the delayed review push end to end
from the worker after the credential fix (the worker's send preceded it;
the same payload was re-sent by hand and arrived), and the heads-up amount
box with a model host.
