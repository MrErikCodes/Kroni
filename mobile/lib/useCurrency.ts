import { useQueryClient } from '@tanstack/react-query';
import type { Currency, Parent, KidMeResponse } from '@kroni/shared';

/**
 * Returns the active currency for the current session, sourced from
 * whichever `me` query is cached. Parent screens have `['parent','me']`
 * mounted; kid screens have `['kid','me']`. We don't fire a fetch from
 * here — every consumer is rendered under a layout that already loads
 * the relevant `me` query, so reading from the cache avoids redundant
 * network and keeps this hook a pure synchronous lookup. Fallback NOK
 * matches the backend column default and renders a sensible "kr"
 * before the cache populates on first paint.
 */
export function useCurrency(): Currency {
  const qc = useQueryClient();
  const parent = qc.getQueryData<Parent>(['parent', 'me']);
  if (parent?.currency) return parent.currency;
  const kid = qc.getQueryData<KidMeResponse>(['kid', 'me']);
  if (kid?.currency) return kid.currency;
  return 'NOK';
}
