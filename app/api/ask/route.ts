import { NextRequest, NextResponse } from "next/server";
import { searchLocalKnowledge, hasKnowledgeBase } from "@/lib/localSearch";
import { searchWeb } from "@/lib/serpSearch";
import { synthesizeAnswer, generateFollowUps } from "@/lib/llm";
import { getFollowUps } from "@/lib/followUps";

function composeExtractiveAnswer(
  localChunks: ReturnType<typeof searchLocalKnowledge>,
  webSnippets: Awaited<ReturnType<typeof searchWeb>>
): string {
  if (!localChunks.length && !webSnippets.length) {
    return "I couldn't find anything about that yet — try adding more PDF stories to /data/pdfs, or ask something else about Ganapati.";
  }

  const parts: string[] = [];
  if (localChunks[0]) {
    parts.push(localChunks[0].text.trim());
  }
  if (webSnippets[0] && webSnippets[0].snippet) {
    parts.push(webSnippets[0].snippet.trim());
  }
  return parts.join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const { question, askedQuestions } = await req.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "A question is required." }, { status: 400 });
    }

    const history: string[] = Array.isArray(askedQuestions)
      ? askedQuestions.filter((q): q is string => typeof q === "string")
      : [];

    const localChunks = searchLocalKnowledge(question, 3);
    const webSnippets = await searchWeb(question, 3);

    const llmAnswer = await synthesizeAnswer(question, localChunks, webSnippets);
    const answer = llmAnswer || composeExtractiveAnswer(localChunks, webSnippets);

    // Contextual "suggested question" chips: try the LLM for sharper,
    // fully dynamic follow-ups; fall back to the offline topic matcher
    // (always available, no API key needed) if that isn't possible.
    const llmFollowUps = await generateFollowUps(question, answer, history);
    const followUps = llmFollowUps || getFollowUps(question, answer, history);

    return NextResponse.json({
      answer,
      mode: llmAnswer ? "llm" : "extractive",
      followUps,
      sources: {
        stories: localChunks.map((c) => ({ source: c.source, excerpt: c.text.slice(0, 160) })),
        web: webSnippets.map((s) => ({ title: s.title, link: s.link })),
      },
      knowledgeBaseLoaded: hasKnowledgeBase(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong answering that." }, { status: 500 });
  }
}
