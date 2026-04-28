import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isProActive, presentPaywall } from './billing';

export function useEnsurePro(): { isPro: boolean; present: () => Promise<boolean> } {
  const { data: isPro = false } = useQuery({
    queryKey: ['billing', 'isPro'],
    queryFn: isProActive,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const present = useCallback(async (): Promise<boolean> => {
    return presentPaywall();
  }, []);

  return { isPro, present };
}
