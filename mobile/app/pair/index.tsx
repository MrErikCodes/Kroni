// Universal-link / custom-scheme entrypoint for the kid-pairing share
// flow. The parent's share-button generates either:
//   • https://kroni.no/pair/<code>      (universal link, App Links)
//   • kroni://pair?code=<code>           (custom-scheme fallback)
//
// Expo-router maps the second form to `app/pair/index.tsx` (this file)
// and the first form to `app/pair/[code].tsx`. Both immediately redirect
// to the canonical `/auth/kid-pair` screen with the code as a search
// param so the existing pairing UI handles prefill + submit.
//
// The previous build only wired the URL handler inside kid-pair.tsx;
// without these route shims the OS opened the app and expo-router
// landed on its "Unmatched Route" 404, never reaching kid-pair.
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function PairQueryEntry() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const safe = typeof code === 'string' ? code.replace(/\D/g, '').slice(0, 6) : '';
  const target =
    safe.length > 0
      ? (`/auth/kid-pair?code=${safe}` as const)
      : ('/auth/kid-pair' as const);
  return <Redirect href={target} />;
}
