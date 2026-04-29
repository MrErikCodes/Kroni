import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apple's AASA fetcher requires `Content-Type: application/json` on a file
  // with no extension. Next won't infer that from `public/.well-known/`, so
  // pin it explicitly. Android's `assetlinks.json` already gets the right
  // type from the `.json` extension, but pinning here keeps both files
  // consistent and resistant to future static-handler changes.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
