/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix: onnxruntime-web ships .mjs ES modules that webpack tries to
    // process as CommonJS — tell it to treat them as javascript/auto.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    // Do NOT bundle native onnxruntime-node binary on the client side
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };

    return config;
  },
};

export default nextConfig;
