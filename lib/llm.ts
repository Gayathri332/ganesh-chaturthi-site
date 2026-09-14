import type { ScoredChunk } from "./localSearch";
import type { WebSnippet } from "./serpSearch";

/**
 * If COHERE_API_KEY is set, asks Cohere's Command model to weave the
 * retrieved PDF passages and web snippets into one clean answer. If no
 * key is set, the /api/ask route falls back to a plain extractive
 * answer instead — see composeExtractiveAnswer in app/api/ask/route.ts.
 *
 * Note: Cohere's free "trial" key (no billing set up) is rate-limited
 * and meant for evaluation/testing only, not production traffic — see
 * https://docs.cohere.com/docs/rate-limits. That's fine for trying this
 * out, but keep it in mind before sharing the site widely.
 */
export async function synthesizeAnswer(
  question: string,
  localChunks: ScoredChunk[],
  webSnippets: WebSnippet[]
): Promise<string | null> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) return null;

  const context = [
    ...localChunks.map((c, i) => `[Story excerpt ${i + 1} — ${c.source}]\n${c.text}`),
    ...webSnippets.map((s, i) => `[Web result ${i + 1} — ${s.title}]\n${s.snippet}`),
  ].join("\n\n");

  if (!context.trim()) return null;

  try {
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // command-r-plus was retired in 2026 — command-a-plus is Cohere's
        // current flagship chat model. Check https://docs.cohere.com/docs/models
        // for the latest model IDs if this one has moved on by the time you read this.
        model: process.env.COHERE_MODEL || "command-a-plus-05-2026",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You answer questions about Lord Ganesha / Ganapati for a Ganesh Chaturthi greeting website. " +
              "Use only the provided context. Keep the tone warm and devotional but simple, 3-5 sentences. " +
              "If the context doesn't cover the question, say so honestly instead of guessing.",
          },
          {
            role: "user",
            content: `Question: ${question}\n\nContext:\n${context}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const textBlock = (data.message?.content || []).find((b: any) => b.type === "text");
    return textBlock?.text?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Asks the model for 4 short follow-up questions that naturally continue
 * the conversation, given the question just asked and the answer that
 * was given. Returns null (never throws) if no key is set, the request
 * fails, or the response can't be parsed — the /api/ask route falls back
 * to the offline topic matcher in lib/followUps.ts in that case.
 */
export async function generateFollowUps(
  question: string,
  answer: string,
  askedQuestions: string[]
): Promise<string[] | null> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey || !answer.trim()) return null;

  try {
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.COHERE_MODEL || "command-a-plus-05-2026",
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "You suggest short follow-up questions for a Ganesh Chaturthi greeting site's Ganapati Q&A widget. " +
              "Given the question just asked and the answer given, propose 4 short, specific follow-up questions " +
              "a curious devotee would naturally ask next about Lord Ganesha — building on that answer, not repeating it. " +
              "Never repeat the question already asked or anything in the 'already asked' list. " +
              'Respond with ONLY a raw JSON array of 4 short strings, nothing else, e.g. ["Question one?","Question two?","Question three?","Question four?"]',
          },
          {
            role: "user",
            content:
              `Question asked: ${question}\n\nAnswer given: ${answer}\n\n` +
              `Already asked (don't repeat): ${askedQuestions.join(" | ") || "none"}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const textBlock = (data.message?.content || []).find((b: any) => b.type === "text");
    const raw = textBlock?.text?.trim();
    if (!raw) return null;

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return null;

    const cleaned = parsed
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .map((q) => q.trim())
      .slice(0, 4);

    return cleaned.length ? cleaned : null;
  } catch {
    return null;
  }
}
