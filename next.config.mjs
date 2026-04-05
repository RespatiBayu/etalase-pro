/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix: onnxruntime-web ships .mjs ES modules with dynamic require()
    // that webpack can't statically analyse. Tell webpack to ignore them.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    // Exclude native binaries and onnxruntime-node from the client bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };

    // Suppress "Critical dependency: require function" warnings from onnxruntime
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      /Critical dependency.*onnxruntime/,
    ];

    return config;
  },
};

export default nextConfig;
