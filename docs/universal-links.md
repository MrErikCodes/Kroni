# Universal Links + Android App Links

Backs the kid-pairing share-link feature. Parent shares `https://kroni.no/pair/<code>` from the app; tapping the link opens the kid app and prefills the code (instead of falling back to Safari / browser). The `.well-known/` files below are what Apple + Google verify against to allow the auto-open.

Both files live at `website/public/.well-known/` and are served identically on `kroni.no`, `kroni.se`, `kroni.dk` (the proxy serves the same `public/` tree per host). `next.config.ts` pins `Content-Type: application/json` on both paths and disables redirects.

---

## `apple-app-site-association`

Source: `website/public/.well-known/apple-app-site-association` (no extension).

iOS fetches it from `https://<host>/.well-known/apple-app-site-association` after install and enables Universal Links only if the file lists the exact appID.

**Status:** Apple Team ID is filled in (`V992VUTLR2`). Bundle is `V992VUTLR2.no.nilsenkonsult.kroni`. Ready for TestFlight.

`mobile/app.config.ts` declares the matching `ios.associatedDomains: ["applinks:kroni.no", "applinks:kroni.dk", "applinks:kroni.se"]`.

### Verification

```sh
curl -I https://kroni.no/.well-known/apple-app-site-association
# expect: HTTP/2 200, Content-Type: application/json, no redirects
```

Apple's validator: <https://branch.io/resources/aasa-validator/> — paste a domain, it pulls the file and checks structure + content-type.

---

## `assetlinks.json`

Source: `website/public/.well-known/assetlinks.json`.

Required by Android because `mobile/app.config.ts` declares `autoVerify: true` intent filters on `https` for the three hosts. Without this file, Android leaves links in "ask every time" mode — the app never auto-opens.

**Status: ACTION REQUIRED — both SHA-256 placeholders must be swapped before release.**

| Placeholder                  | Where to find it                                                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<UPLOAD_SHA256>`            | EAS dashboard → project → Credentials → Android → Keystore → "SHA-256 Certificate Fingerprint". Or run `keytool -list -v -keystore <upload.keystore>` if downloaded locally. |
| `<PLAY_APP_SIGNING_SHA256>`  | Play Console → app → Setup → App integrity → "App signing key certificate" → SHA-256.                                                                                       |

Format: 64 hex chars, colon-separated, uppercase. Example:
`14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5`

**Both must be present.** Dev / EAS-internal builds are signed with the upload key; production installs from the Play Store are re-signed with the Play app-signing key. Listing both means the app verifies in either case.

### Verification

```sh
curl -s https://kroni.no/.well-known/assetlinks.json | jq .
```

Google's official Digital Asset Links validator:

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://kroni.no&relation=delegate_permission/common.handle_all_urls
```

After the app is installed:

```sh
adb shell pm get-app-links no.nilsenkonsult.kroni
# every host should report: verified
```

---

## Why placeholders instead of just hardcoding

The repo can't ship the production fingerprints + team ID until those credentials exist. Build provisioning + Play Console signing are user-managed, not source-controlled. The README files are the contract: when the credentials arrive, swap them in, deploy the website, install a fresh build, run the verifier commands above.
