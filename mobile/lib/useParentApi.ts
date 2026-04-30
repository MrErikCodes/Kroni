import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { parentApi, clientFor } from './api';

/** Returns a memoized parent API client bound to the Clerk session token. */
export function useParentApi(): ReturnType<typeof clientFor> {
  const { getToken } = useAuth();
  return useMemo(
    () => parentApi.clientFor(() => getToken()),
     
    [getToken],
  );
}
