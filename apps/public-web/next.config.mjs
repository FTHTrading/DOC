const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@doc/ui", "@doc/domain"],
  // Static export for GitHub Pages (with basePath for repo-level deployment)
  ...(process.env.NEXT_OUTPUT_EXPORT === 'true' && { 
    output: 'export',
    basePath: '/DOC',
  }),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
