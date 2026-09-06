import { Platform } from 'react-native';

import type { LinkTokenRequest } from '@/api/client';

/**
 * Which Link SDK will open the token. Plaid's link_token is platform-specific
 * (Android must carry the app's package name, everything else a redirect
 * URI), so the API needs to know before it creates one.
 */
export function linkPlatform(): NonNullable<LinkTokenRequest['platform']> {
  switch (Platform.OS) {
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    default:
      return 'web';
  }
}
