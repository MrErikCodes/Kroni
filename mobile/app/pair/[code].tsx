// Path-segment variant of the pair entrypoint. Matches universal links
// of the form `https://kroni.no/pair/<code>`. See `app/pair/index.tsx`
// for the rationale + the custom-scheme counterpart.
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function PairPathEntry() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const safe = typeof code === 'string' ? code.replace(/\D/g, '').slice(0, 6) : '';
  const target =
    safe.length > 0
      ? (`/auth/kid-pair?code=${safe}` as const)
      : ('/auth/kid-pair' as const);
  return <Redirect href={target} />;
}
