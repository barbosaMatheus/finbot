/** Mirrors the DTOs returned by the API's /plaid routes. */

export type LinkTokenResult = {
  linkToken: string;
  expiration: string | null;
  /** Plaid-hosted browser flow. Used by the web client. */
  hostedLinkUrl: string | null;
};

export type PlaidAccountSummary = {
  accountId: string;
  name: string;
  officialName: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  currentBalance: number | null;
  availableBalance: number | null;
  isoCurrencyCode: string | null;
};

export type PlaidConnection = {
  id: string;
  itemId: string;
  institutionId: string | null;
  institutionName: string | null;
  status: string;
  createdAt: string;
  accounts: PlaidAccountSummary[];
};

export type HostedLinkCompletion =
  | { status: 'pending' }
  | { status: 'connected'; connection: PlaidConnection };

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
  connection: PlaidConnection | null;
  error: string | null;
  connect: () => void;
};
