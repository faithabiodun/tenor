import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import type {NextConfig} from "next";

/**
 * npm workspaces hoist `next` into the repo-root node_modules, but Turbopack infers its
 * workspace root from the nearest lockfile and would otherwise resolve from web/ only.
 * Point both it and output tracing at the repo root so the build finds the hoisted deps.
 */
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {root: repoRoot},
  outputFileTracingRoot: repoRoot,
};

export default config;
