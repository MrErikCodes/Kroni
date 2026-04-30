// Path-segment variant of the pair entrypoint. Matches universal links
// of the form `https://kroni.no/pair/<code>`. See
// `components/pair/PairLinkRouter.tsx` for the routing logic and
// `app/pair/index.tsx` for the custom-scheme counterpart.
import { useLocalSearchParams } from 'expo-router';
import { PairLinkRouter } from '../../components/pair/PairLinkRouter';

export default function PairPathEntry() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const safe = typeof code === 'string' ? code.replace(/\D/g, '').slice(0, 6) : '';
  return <PairLinkRouter code={safe} />;
}
