/**
 * Contract types come from the generated client (APP-002); only UI-local
 * state types are defined here. No handwritten DTO duplication.
 */

export type {
  HostedLinkCompletion,
  LinkTokenResult,
  PlaidConnection,
} from '@/api/client';

export type PlaidAccountSummary =
  import('@/api/client').PlaidConnection['accounts'][number];

/**
 * `checking` covers the initial "have they already linked?" lookup, so the
 * screen can render a connected state on re-entry without flashing the CTA.
 */
export type ConnectBankStatus =
  | 'checking'
  | 'idle'
  | 'linking'
  | 'connected'
  | 'error';

export type UsePlaidLinkResult = {
  status: ConnectBankStatus;
  connection: import('@/api/client').PlaidConnection | null;
  error: string | null;
  connect: () => void;
};
