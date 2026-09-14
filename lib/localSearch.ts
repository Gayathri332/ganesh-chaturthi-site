import fs from "fs";
import path from "path";

export interface KnowledgeChunk {
  id: string;
  text: string;
  source: string;
}

export interface ScoredChunk extends KnowledgeChunk {
  score: number;
}

const KNOWLEDGE_PATH = path.join(process.cwd(), "data", "knowledge.json");

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "and", "to", "in",
  "on", "for", "it", "this", "that", "with", "as", "by", "at", "from",
  "be", "or", "he", "his", "him", "who", "what", "why", "how", "did",
  "do", "does", "about", "tell", "me", "you", "please",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

let cachedChunks: KnowledgeChunk[] | null = null;

function loadChunks(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks;
  try {
    const raw = fs.readFileSync(KNOWLEDGE_PATH, "utf-8");
    cachedChunks = JSON.parse(raw) as KnowledgeChunk[];
  } catch {
    cachedChunks = [];
  }
  return cachedChunks;
}

/**
 * Ranks the ingested PDF chunks against a question using term-frequency
 * overlap (a simple, dependency-free stand-in for real embedding search).
 * Swap this out for Cohere/Sentence-Transformer embeddings + cosine
 * similarity later if you want closer-to-semantic matching — see README.
 */
export function searchLocalKnowledge(question: string, topK = 3): ScoredChunk[] {
  const chunks = loadChunks();
  if (!chunks.length) return [];

  const queryTerms = tokenize(question);
  if (!queryTerms.length) return [];

  const scored = chunks.map((chunk) => {
    const chunkTerms = tokenize(chunk.text);
    const termCounts = new Map<string, number>();
    chunkTerms.forEach((t) => termCounts.set(t, (termCounts.get(t) || 0) + 1));

    let score = 0;
    for (const qt of queryTerms) {
      const count = termCounts.get(qt) || 0;
      if (count > 0) score += 1 + Math.log(count);
    }
    // Normalize a little by chunk length so long chunks don't dominate purely on volume
    score = score / Math.sqrt(chunkTerms.length || 1);

    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function hasKnowledgeBase(): boolean {
  return loadChunks().length > 0;
}
