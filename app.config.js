// Overlay on app.json. Expo hands app.json in as `config`; this file adds the
// one value that depends on the machine doing the build.
//
// google-services.json is Firebase's per-app config, which Android push (FCM)
// needs. It is git-ignored. On EAS Build it arrives as a *file* environment
// variable — GOOGLE_SERVICES_JSON, whose value at build time is a path on the
// build machine. Locally the file sits at the project root. When neither
// exists the build still succeeds and push registration fails at runtime
// instead, which keeps web and iOS work unaffected. See docs/android-build.md.

const fs = require('node:fs');
const path = require('node:path');

const LOCAL_GOOGLE_SERVICES = './google-services.json';

function googleServicesFile() {
  const fromEnv = process.env.GOOGLE_SERVICES_JSON?.trim();

  if (fromEnv) {
    return fromEnv;
  }

  return fs.existsSync(path.join(__dirname, LOCAL_GOOGLE_SERVICES))
    ? LOCAL_GOOGLE_SERVICES
    : undefined;
}

module.exports = ({ config }) => {
  const file = googleServicesFile();

  return {
    ...config,
    android: {
      ...config.android,
      ...(file ? { googleServicesFile: file } : {}),
    },
  };
};
