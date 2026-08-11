/**
 * Next loads .env from the app directory, but this is a workspace and the credentials live
 * in the repo-root .env alongside the contract and agent config. Load that once at server
 * startup so the route handlers can reach the model provider.
 *
 * In production the platform injects real environment variables and no .env file exists;
 * dotenv treats a missing file as a no-op, and it never overwrites what is already set.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DEEPSEEK_API_KEY) return;

  const [{config}, {resolve}] = await Promise.all([import("dotenv"), import("node:path")]);

  // `next start` runs with cwd at web/; the Railway start command runs it from the repo
  // root. Try both rather than depending on which one invoked us.
  for (const candidate of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "..", ".env")]) {
    config({path: candidate, quiet: true});
    if (process.env.DEEPSEEK_API_KEY) return;
  }
}
