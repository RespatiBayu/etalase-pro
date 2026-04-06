import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Fix: onnxruntime-web ships .mjs ES modules with dynamic require()
    // that webpack can't statically analyse. Tell webpack to ignore them.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: { fullySpecified: false },
    });

    if (!isServer) {
      // Fix: onnxruntime-web package.json has a "node" exports condition that
      // Next.js webpack sometimes picks (loading ort.node.min.mjs in browser →
      // "e.replace is not a function"). Force the browser bundle explicitly.
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
    } else {
      // Server: exclude onnxruntime from server bundle (browser-only)
      config.resolve.alias = {
        ...config.resolve.alias,
        "sharp$": false,
        "onnxruntime-node$": false,
      };
    }

    // Suppress "Critical dependency: require function" warnings from onnxruntime-web
    // (internal dynamic requires inside pre-built ort bundles — harmless in browser)
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      /Critical dependency.*onnxruntime/,
      (w) => {
        const msg = w.message ?? "";
        const mod = (w.module?.identifier?.() ?? w.module?.resource ?? "");
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
