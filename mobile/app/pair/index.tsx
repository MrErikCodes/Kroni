// Universal-link / custom-scheme entrypoint for the kid-pairing share
// flow. See `components/pair/PairLinkRouter.tsx` for the routing logic
// — this file just extracts the code from the URL query and hands it
// off. The parent's share-button generates either:
//   • https://kroni.no/pair/<code>      (universal link, App Links) → app/pair/[code].tsx
//   • kroni://pair?code=<code>           (custom-scheme fallback)    → this file
import { useLocalSearchParams } from 'expo-router';
import { PairLinkRouter } from '../../components/pair/PairLinkRouter';

export default function PairQueryEntry() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const safe = typeof code === 'string' ? code.replace(/\D/g, '').slice(0, 6) : '';
  return <PairLinkRouter code={safe} />;
}
