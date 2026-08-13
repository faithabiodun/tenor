import {existsSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {config as loadEnv} from "dotenv";
import type {NextConfig} from "next";

/**
 * npm workspaces hoist `next` into the repo-root node_modules, but Turbopack infers its
 * workspace root from the nearest lockfile and would otherwise resolve from web/ only.
 * Point both it and output tracing at the repo root so the build finds the hoisted deps.
 */
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Credentials live in the repo-root .env alongside the contract and agent config, but Next
 * only reads .env from the app directory. Load it here: this file is evaluated by the Node
 * server at startup, before any route handler imports run, and unlike instrumentation.ts it
 * is never compiled for the Edge runtime, where node:path is rejected outright.
 *
 * Production injects real environment variables and no file exists; dotenv treats that as a
 * no-op and never overwrites what is already set.
 */
const rootEnv = resolve(repoRoot, ".env");
if (existsSync(rootEnv)) loadEnv({path: rootEnv, quiet: true});

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {root: repoRoot},
  outputFileTracingRoot: repoRoot,
  // The agents workspace ships TypeScript source rather than a build artefact, so Next has
  // to compile it the same way it compiles the app.
  transpilePackages: ["@tenor/agents"],
};

export default config;
