const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      `default-src 'none';` +
      `base-uri 'none';` +
      `child-src 'self' app.netlify.com;` +
      `form-action 'none';` +
      `frame-ancestors 'none';` +
      `img-src 'self' data:;` +
      `media-src 'self';` +
      `object-src 'none';` +
      `script-src 'self' app.netlify.com netlify-cdp-loader.netlify.app ${
        process.env.NODE_ENV === "development" ? `'unsafe-eval'` : ""
      };` +
      `style-src 'self' fonts.googleapis.com 'unsafe-inline';` +
      `font-src fonts.gstatic.com;` +
      `connect-src 'self' ocean.defichain.com 35.241.191.23:3000 *.jellyfishsdk.com playground.jellyfishsdk.com wallet.defichain.com; ${
        process.env.NODE_ENV === "development"
          ? `ws://localhost:3000/_next/webpack-hmr`
          : ""
      };` +
      `prefetch-src 'self';`,
  },
  {
    key: "Referrer-Policy",
    value: "same-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

module.exports = {
  experimental: {
    forceSwcTransforms: true,
  },
  swcMinify: true,
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "page.ts"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirect() {
    return [
      {
        source: '/ocg/:path*',
        destination: '/on-chain-governance/:path*',
        permanent: true
      }
    ]
  }
};
