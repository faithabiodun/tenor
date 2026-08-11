import OpenAI from "openai";
import type {ZodType} from "zod";

/**
 * DeepSeek speaks the OpenAI wire format, so the OpenAI client points at their host.
 *
 * Note this is JSON *mode*, not schema-constrained decoding: DeepSeek guarantees the
 * response parses as JSON, not that it matches our shape. So validation and the single
 * retry below are load-bearing, not belt-and-braces.
 */
const BASE_URL = "https://api.deepseek.com";

export const DEBATE_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro";

let cached: OpenAI | undefined;

function client(): OpenAI {
  if (cached) return cached;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. Copy .env.example to .env and fill it in.",
    );
  }
  cached = new OpenAI({apiKey, baseURL: BASE_URL});
  return cached;
}

export interface AskOptions<T> {
  /** Which agent is speaking, used in error messages and progress output. */
  label: string;
  system: string;
  user: string;
  schema: ZodType<T>;
  /**
   * Bull and bear run warm so they do not collapse onto the same number; the arbiter
   * runs cold because we want its verdict to be reproducible. See section 7.5.
   */
  temperature?: number;
  model?: string;
}

/**
 * One agent turn: ask, parse, validate. On a bad response, retry exactly once with the
 * validation error fed back, then give up with a message that says what went wrong.
 */
export async function ask<T>(options: AskOptions<T>): Promise<T> {
  const {label, system, user, schema, temperature = 0, model = DEBATE_MODEL} = options;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {role: "system", content: system},
    {role: "user", content: user},
  ];

  let lastError = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    const completion = await client().chat.completions.create({
      model,
      messages,
      temperature,
      response_format: {type: "json_object"},
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const result = parseAndValidate(raw, schema);
    if (result.ok) return result.value;

    lastError = result.error;
    if (attempt === 2) break;

    // Feed the failure back rather than re-rolling blind. The model usually fixes a
    // shape error when it can see which field was wrong.
    messages.push(
      {role: "assistant", content: raw},
      {
        role: "user",
        content:
          `That response was rejected: ${result.error}\n` +
          `Reply again with the corrected json object only. No prose, no markdown fences.`,
      },
    );
  }

  throw new Error(`${label} agent returned an unusable response after a retry: ${lastError}`);
}

type ParseResult<T> = {ok: true; value: T} | {ok: false; error: string};

function parseAndValidate<T>(raw: string, schema: ZodType<T>): ParseResult<T> {
  if (!raw) return {ok: false, error: "empty response"};

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch (error) {
    return {ok: false, error: `not valid json (${(error as Error).message})`};
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    const issues = validated.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    return {ok: false, error: issues};
  }

  return {ok: true, value: validated.data};
}

/**
 * The prompts forbid markdown fences and DeepSeek's json mode makes them unlikely, but
 * a stray ```json wrapper is a silly thing to fail a demo on.
 */
function stripFences(raw: string): string {
  const fenced = raw.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  return fenced?.[1] ?? raw;
}
