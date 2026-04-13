/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Mark heavy native packages as server externals so Next.js doesn't
    // try to bundle them into serverless functions via webpack.
    serverComponentsExternalPackages: ["sharp"],
  },
  webpack: (config, { isServer }) => {
    // Allow webpack to handle .mjs files from node_modules with bare imports.
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    if (!isServer) {
      // Prevent server-only packages from being pulled into the client bundle.
      config.resolve.alias = {
        ...config.resolve.alias,
        "sharp$": false,
        "onnxruntime-node$": false,
      };
    }

    return config;
  },
};

export default nextConfig;
