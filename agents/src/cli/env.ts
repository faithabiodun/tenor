import {config} from "dotenv";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

/** Load the repo-root .env once, before anything reads process.env. */
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

config({path: resolve(REPO_ROOT, ".env"), quiet: true});
