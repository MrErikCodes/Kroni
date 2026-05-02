// Custom-scheme entrypoint for `kroni://invite?code=<code>`. The marketing
// site's `/invite/<code>` page bounces the browser to this URL via
// `window.location.href` — see `website/app/[lang]/invite/[code]/page.tsx`.
// Path-segment counterpart at `app/invite/[code].tsx` handles the
// universal-link form `https://kroni.no/invite/<code>` once iOS AASA /
// Android App Links verification succeeds in production builds.
import { useLocalSearchParams } from 'expo-router';
import { InviteLinkRouter } from '../../components/invite/InviteLinkRouter';

export default function InviteQueryEntry() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const safe = typeof code === 'string' ? code.replace(/\D/g, '').slice(0, 6) : '';
  return <InviteLinkRouter code={safe} />;
}
