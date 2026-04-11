import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 14 syntax — Next 15 moved this to top-level `serverExternalPackages`.
  // @imgly/background-removal-node + onnxruntime-node ship native binaries
  // and ONNX models that webpack can't bundle. Mark as external so they're
  // require()'d at runtime from node_modules instead.
  experimental: {
    serverComponentsExternalPackages: [
      "@imgly/background-removal-node",
      "onnxruntime-node",
      "sharp",
    ],
    // Ensure Vercel includes the model files + native binaries in the
    // serverless function bundle (otherwise file tracing misses them).
    outputFileTracingIncludes: {
      "/api/editor/remove-bg": [
        "./node_modules/@imgly/background-removal-node/dist/**/*",
        "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*",
      ],
    },
    // Strip onnxruntime-node binaries for darwin / win32 / linux-arm64
    // so we stay under Vercel's 250MB serverless function size limit.
    outputFileTracingExcludes: {
      "/api/editor/remove-bg": [
        "./node_modules/onnxruntime-node/bin/napi-v3/darwin/**/*",
        "./node_modules/onnxruntime-node/bin/napi-v3/win32/**/*",
        "./node_modules/onnxruntime-node/bin/napi-v3/linux/arm64/**/*",
      ],
    },
  },
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
    }
    // Server: onnxruntime-node + @imgly are handled via serverExternalPackages
    // above, so we don't alias them here. Letting webpack ignore them as
    // external means Node will require() them at runtime.

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
