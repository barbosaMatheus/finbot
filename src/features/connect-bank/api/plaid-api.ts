/**
 * Thin re-exports of the generated, typed client (APP-002) so existing
 * feature imports keep working without duplicated DTOs.
 */

export {
  completeHostedLink,
  createLinkToken,
  disconnectConnection,
  exchangePublicToken,
  listConnections as fetchConnections,
} from '@/api/client';
