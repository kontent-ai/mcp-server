// Runs this server against a clone of the Management API SDK checked out next to this repository
// (../management-sdk-js) instead of the published package, without changing node_modules:
//
//   node scripts/localSdk.mjs build    builds the clone's dist/cjs, which Node loads and TypeScript reads
//   --import ./scripts/localSdk.mjs    as a Node preload: a resolve hook answers imports of
//                                      @kontent-ai/management-sdk with the clone, in that process only
//
// Used by the *:local-sdk npm scripts. Needs Node 22.15 or newer.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import * as nodeModule from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageName = "@kontent-ai/management-sdk";
const sdkDirectory = fileURLToPath(
  new URL("../../management-sdk-js/", import.meta.url),
).replace(/[\\/]$/, "");
const entryPoint = path.join(sdkDirectory, "dist", "cjs", "index.js");

const build = () => {
  if (!existsSync(path.join(sdkDirectory, "node_modules", "typescript"))) {
    console.error(
      `[local-sdk] ${sdkDirectory} has no dependencies installed: clone management-sdk-js next to this repository and run npm ci in it.`,
    );
    return 1;
  }
  console.error(
    `[local-sdk] building ${sdkDirectory} (npm run build:commonjs)`,
  );
  // The build's output goes to stderr so the stdio transport's stdout stays clean.
  const result = spawnSync(
    "npm",
    ["--prefix", sdkDirectory, "run", "build:commonjs"],
    {
      stdio: ["ignore", 2, 2],
      shell: process.platform === "win32",
    },
  );
  return result.status ?? 1;
};

const usage = () => {
  console.error("usage: node scripts/localSdk.mjs build");
  return 1;
};

// Answers directly instead of delegating: CommonJS resolution does not accept a file: URL as a specifier.
const resolve = (specifier, context, nextResolve) => {
  if (specifier !== packageName && !specifier.startsWith(`${packageName}/`)) {
    return nextResolve(specifier, context);
  }
  const subpath = specifier.slice(packageName.length + 1);
  const target = subpath ? path.join(sdkDirectory, subpath) : entryPoint;
  return { url: pathToFileURL(target).href, shortCircuit: true };
};

const runAsCommand =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (runAsCommand) {
  process.exitCode = process.argv[2] === "build" ? build() : usage();
} else {
  if (typeof nodeModule.registerHooks !== "function") {
    throw new Error(
      `[local-sdk] needs Node 22.15 or newer (running ${process.version}).`,
    );
  }
  if (!existsSync(entryPoint)) {
    throw new Error(
      `[local-sdk] ${entryPoint} not found: run "node scripts/localSdk.mjs build" first.`,
    );
  }
  nodeModule.registerHooks({ resolve });
  console.error(`[local-sdk] ${packageName} is loaded from ${sdkDirectory}`);
}
