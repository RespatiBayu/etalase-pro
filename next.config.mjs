/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js 14 key — tell webpack NOT to bundle native .node binary packages.
    // They must be required at runtime by Node.js directly.
    serverComponentsExternalPackages: [
      "@imgly/background-removal-node",
      "onnxruntime-node",
    ],
  },
};

export default nextConfig;
