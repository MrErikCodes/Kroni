// Path-segment universal-link entrypoint for co-parent household invites.
// Matches `https://kroni.no/invite/<code>` (declared in app.config.ts under
// the iOS associatedDomains AASA components and the Android intentFilter
// pathPrefix `/invite/`). Custom-scheme counterpart lives at
// `app/invite/index.tsx`. Both extract the 6-digit numeric code and forward
// to the shared `InviteLinkRouter` which decides where the user lands.
import { useLocalSearchParams } from 'expo-router';
import { InviteLinkRouter } from '../../components/invite/InviteLinkRouter';

export default function InvitePathEntry() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const safe = typeof code === 'string' ? code.replace(/\D/g, '').slice(0, 6) : '';
  return <InviteLinkRouter code={safe} />;
}
