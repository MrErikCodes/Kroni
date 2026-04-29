# apple-app-site-association

This file is served by Next.js straight from `public/.well-known/` on every
host the site answers on (`kroni.no`, `kroni.dk`, `kroni.se`). Apple's CDN
fetches it from `https://<host>/.well-known/apple-app-site-association` with
**no extension** and `Content-Type: application/json` (forced via
`next.config.ts` `headers()`). HTTPS only, no redirects.

## Action required before TestFlight

Replace the literal placeholder `<TEAM_ID>` with the 10-character Apple
Developer team ID. Find it in:

- App Store Connect → Membership → "Team ID", or
- developer.apple.com → Account → Membership details, or
- the Xcode signing pane after the app is configured.

The full `appIDs` value must look like e.g. `7XYZABC123.no.nilsenkonsult.kroni`.
The bundle ID `no.nilsenkonsult.kroni` is fixed (see `mobile/app.config.ts`),
the team ID is the only unknown.

## Why this file exists at all

`mobile/app.config.ts` declares `ios.associatedDomains: ["applinks:kroni.no",
"applinks:kroni.dk", "applinks:kroni.se"]`. iOS, after install, fetches AASA
from each host and only enables Universal Links if the file lists this exact
appID. A wrong team ID = links open in Safari, not in the app.

## Verification

After deploy:

```sh
curl -I https://kroni.no/.well-known/apple-app-site-association
# expect: HTTP/2 200, Content-Type: application/json, no redirects
```

Apple's validator: <https://branch.io/resources/aasa-validator/> (paste a
domain, it pulls the file and validates structure + JSON content type).
