import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @imgly/background-removal ships both browser & node builds. We use it
  // client-side only (background removal in the editor), so mark its node
  // companions as externals on the server side to skip Node-target bundling.
  experimental: {
    serverComponentsExternalPackages: [
      "@imgly/background-removal",
      "onnxruntime-node",
      "sharp",
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Allow webpack to handle .mjs files from node_modules with bare imports.
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    if (!isServer) {
      // Browser side: force onnxruntime-web to its prebuilt browser bundle.
      // The package's "node" exports condition can otherwise be picked, which
      // loads ort.node.min.mjs in the browser → "e.replace is not a function".
      config.resolve.alias = {
        ...config.resolve.alias,
        "onnxruntime-web": path.resolve(
          __dirname,
          "node_modules/onnxruntime-web/dist/ort.bundle.min.mjs"
        ),
        "sharp$": false,
        "onnxruntime-node$": false,
      };

      // onnxruntime-web/webgpu is a subpath export — webpack alias doesn't
      // intercept subpaths, so use NormalModuleReplacementPlugin instead.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^onnxruntime-web\/webgpu$/,
          path.resolve(
            __dirname,
            "node_modules/onnxruntime-web/dist/ort.webgpu.bundle.min.mjs"
          )
        )
      );
    }

    // Suppress noisy "Critical dependency: require function" warnings from
    // pre-built ort bundles — harmless dynamic requires inside the bundle.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      /Critical dependency.*onnxruntime/,
      (w) => {
        const msg = w.message ?? "";
        const mod = w.module?.identifier?.() ?? w.module?.resource ?? "";
        return (
          msg.includes("Critical dependency") &&
          (mod.includes("onnxruntime") || mod.includes("ort."))
        );
      },
    ];

    return config;
  },
};

export default nextConfig;
