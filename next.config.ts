import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Portfolio logo marks are self-authored SVGs (see public/portfolio/logos/,
    // generated in-repo, no third-party or user-uploaded content) — safe to
    // allow through next/image's optimizer, which blocks SVG by default since
    // untrusted SVGs can carry embedded scripts. The CSP below neutralizes
    // that risk on the served response regardless.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
