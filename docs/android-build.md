# Android build and the push walk

How to get FinBot onto an Android phone the way a user would get it — an
installable APK built in the cloud by EAS, push notifications through
Firebase Cloud Messaging (FCM), Plaid Link through the native SDK, and the
API reached over HTTPS — and what to check once it is there.

No Apple developer account is involved. Expo Go cannot do this walk: it has
neither Plaid's native module nor a push token of its own.

## One-time setup

### 1. Expo account

```bash
cd finbot
npx eas-cli login
npx eas-cli project:info      # must print the project behind app.json's projectId
```

If `project:info` says the project is not found or not yours, the id in
`app.json` belongs to another account. Run `npx eas-cli init` to create one
under yours; it rewrites `extra.eas.projectId`. Push tokens are scoped to the
project id, so do this before the first build, not after.

### 2. Firebase (FCM credentials)

1. [Firebase console](https://console.firebase.google.com) → Add project
   (Analytics off is fine).
2. Add an **Android** app with package name `com.finbotpbd.finbot`. Download
   `google-services.json` into `finbot/`. It is git-ignored; `app.config.js`
   picks it up from there for local builds.
3. Project settings → Service accounts → **Generate new private key**. Save
   the JSON somewhere outside the repo (it is a signing credential; the
   `.gitignore` also blocks the usual `*firebase-adminsdk*.json` name).
4. Hand the key to EAS, which sends the pushes:

   ```bash
   npx eas-cli credentials -p android
   # → production (the credentials are per project, not per profile)
   # → Google Service Account
   # → Manage your Google Service Account Key for Push Notifications (FCM V1)
   # → Set up a Google Service Account Key for Push Notifications (FCM V1)
   # → Upload a new service account key → path to the JSON from step 3
   ```

### 3. EAS environment variables

EAS builds from an upload that honours `.gitignore`, so the git-ignored
`google-services.json` has to travel as a *file* variable. The API address
is inlined into the bundle at build time, so it travels as a plain one.

```bash
cd finbot
npx eas-cli env:set --scope project --type file --visibility secret \
  --environment development --environment preview --environment production \
  --name GOOGLE_SERVICES_JSON --value ./google-services.json

npx eas-cli env:set --scope project --type string --visibility plaintext \
  --environment preview \
  --name EXPO_PUBLIC_API_BASE_URL --value https://<your-tunnel-host>
```

`eas.json` ties each build profile to the environment of the same name.
`app.config.js` reads `GOOGLE_SERVICES_JSON` (a path on the build machine)
and falls back to the local file.

### 4. Plaid dashboard

Team Settings → API → **Allowed Android package names** → add
`com.finbotpbd.finbot`. Plaid requires the package name on every Android
Link token and rejects names it has not seen. The API sends it when the
client says `platform: "android"` and `PLAID_ANDROID_PACKAGE_NAME` is set
(see below); web and iOS tokens never carry it.

### 5. A public HTTPS address for the API

A release-style Android build refuses plain HTTP, and the phone is not on
`localhost`. Cheapest option: an ngrok tunnel to the laptop. A free ngrok
account gives one static domain, so the address survives restarts.

```bash
ngrok http --domain=<your-static-domain>.ngrok-free.dev 3000
```

Leave it running for as long as the phone needs the API. The same address
serves Plaid webhooks.

## Each time

### Start the stack for the phone

In `finbot-app/.env`:

```
PLAID_WEBHOOK_URL=https://<your-tunnel-host>/plaid/webhook
PLAID_ANDROID_PACKAGE_NAME=com.finbotpbd.finbot
```

Then `docker compose up -d` (add `--profile llm` if a model host is in use).
Changed values recreate only the containers that read them.

### Build and install

```bash
cd finbot
npx eas-cli build -p android --profile preview
```

Ten to twenty minutes on the free tier. The build page ends with an APK
link and a QR code; open it on the phone, allow installs from that source
when Android asks, install. A phone with no SIM on Wi-Fi is enough.

Rebuild only when native configuration changes (a plugin, a dependency
with native code, `app.json`); JavaScript-only changes need a rebuild too
for this profile, since there is no dev server in a preview build. For a
tighter loop, the `development` profile produces a dev client that loads
JavaScript from Metro on the laptop.

## The walk

In order. Each line is one thing to see.

1. Sign up (a fresh email), log in.
2. Onboarding → connect a bank → Plaid Link opens **inside the app** (not a
   browser tab) → First Platypus Bank → `user_good` / `pass_good` → back in
   the app with the institution listed.
3. Allow notifications when asked (Android 13+ shows the system prompt).
4. Review → confirm → home shows the plan.
5. Anchor opens from the card; settings: pick the time of day whose hour
   comes next (anchor hours are server time, on the hour).
6. Background the app (home button, not swipe-away is fine; either should
   work). At the top of that hour the anchor push appears on the lock
   screen. Tap it → the anchor opens.
7. Delayed review push: set `ANALYSIS_EXPECTED_WINDOW_SECONDS=0`, `docker
   compose up -d`, link another institution and background the app during
   analysis → "Your financial review is ready." → tap → the review.
8. Kill the app and relaunch: still logged in (tokens live in SecureStore).

If waiting for the hour is too slow, a throwaway script run inside the api
container can call `sendGameplanPush` for the user; delete it afterwards.

Record the result in `docs/onboarding-verification.md` (device section)
and fix anything that breaks in the repository that owns it.

## When something is off

- **"Default FirebaseApp is not initialized"** at the notifications step:
  the build had no `google-services.json`. Check `eas env:list --environment
  preview` shows `GOOGLE_SERVICES_JSON`, rebuild.
- **Push token registers but nothing arrives**: the FCM V1 key is missing or
  for another Firebase project (`eas credentials -p android` shows what is
  uploaded); or the phone's battery saver is deferring background delivery
  — exempt FinBot in the phone's battery settings for the walk.
- **Plaid Link fails to open with a message about the package name**: the
  API's `PLAID_ANDROID_PACKAGE_NAME` is unset (the API answers 503 with the
  variable's name) or the name is not in the Plaid dashboard's allowed list.
- **Requests fail on the phone but work in the browser**: the tunnel is
  down, or the APK was built with a different `EXPO_PUBLIC_API_BASE_URL`
  (`eas env:list --environment preview`). ngrok's free tier shows a warning
  page only to browsers; the app's requests pass.
- **Plain-HTTP address unavoidable** (a LAN IP with no tunnel): add
  `expo-build-properties` with `android.usesCleartextTraffic: true` to the
  plugins and rebuild. Prefer the tunnel.

## Out of scope here

iOS (an Apple developer account and an APNs key through the same
`eas credentials` flow; the app code path is shared), Play Store
distribution, and a real host for the API instead of the tunnel.
