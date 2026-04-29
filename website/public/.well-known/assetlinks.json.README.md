# assetlinks.json

Android App Links verification file, served from `/.well-known/assetlinks.json`
as `application/json` (no redirects, HTTPS) on `kroni.no`, `kroni.dk` and
`kroni.se`. Required because `mobile/app.config.ts` declares an
`autoVerify: true` intent filter on `https` for those three hosts — without
this file, the OS leaves the link in "ask every time" mode and the app
never auto-opens.

## Action required before launch

Replace BOTH SHA-256 placeholders with the real fingerprints.

**Both must be present.** Dev builds (TestFlight equivalent / EAS internal
distribution) are signed with the upload key; production installs from the
Play Store are re-signed by Google with the Play app-signing key. Listing
both means the app verifies in either case.

| Placeholder                  | Where to find it                                                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<UPLOAD_SHA256>`            | EAS dashboard → project → Credentials → Android → Keystore → "SHA-256 Certificate Fingerprint". Or run `keytool -list -v -keystore <upload.keystore>` if downloaded locally. |
| `<PLAY_APP_SIGNING_SHA256>`  | Play Console → app → Setup → App integrity → "App signing key certificate" → SHA-256.                                                                                       |

Format: 64 hex chars, colon-separated, uppercase, e.g.
`14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5`.

## Verification

After deploy:

```sh
curl -s https://kroni.no/.well-known/assetlinks.json | jq .
```

Google's official validator (also tests the Digital Asset Links protocol
end-to-end):

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://kroni.no&relation=delegate_permission/common.handle_all_urls
```

After the app is installed on a device:

```sh
adb shell pm get-app-links no.nilsenkonsult.kroni
# every host should report: verified
```
