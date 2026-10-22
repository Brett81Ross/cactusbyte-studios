// Preserve the canonical PNG inside the two Node.js icon functions when
// Vercel traces serverless route dependencies. No other project config changes.
const nextConfig = {
  outputFileTracingIncludes: {
    "/pwa-icon-192": ["./public/logo2.png"],
    "/pwa-icon-512": ["./public/logo2.png"],
  },
};

export default nextConfig;
