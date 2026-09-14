/**
 * Run with: npm run ingest
 *
 * Reads every PDF in /data/pdfs, extracts the text, splits it into
 * ~600-character chunks, and writes them to /data/knowledge.json.
 * The Ask Ganapati widget's API route reads that file at request time.
 */
import fs from "fs";
import path from "path";
// @ts-ignore — pdf-parse has no bundled types
import pdfParse from "pdf-parse";

const PDFS_DIR = path.join(process.cwd(), "data", "pdfs");
const OUTPUT_PATH = path.join(process.cwd(), "data", "knowledge.json");
const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 80;

interface KnowledgeChunk {
  id: string;
  text: string;
  source: string;
}

function chunkText(text: string, source: string): KnowledgeChunk[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: KnowledgeChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    const slice = clean.slice(start, end).trim();
    if (slice.length > 40) {
      chunks.push({ id: `${source}-${index}`, text: slice, source });
      index += 1;
    }
    if (end === clean.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function main() {
  if (!fs.existsSync(PDFS_DIR)) {
    fs.mkdirSync(PDFS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(PDFS_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (!files.length) {
    console.log(`No PDFs found in ${PDFS_DIR}. Add your Ganapati story PDFs there and re-run "npm run ingest".`);
    fs.writeFileSync(OUTPUT_PATH, "[]", "utf-8");
    return;
  }

  const allChunks: KnowledgeChunk[] = [];

  for (const file of files) {
    const filePath = path.join(PDFS_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    const chunks = chunkText(parsed.text, file);
    allChunks.push(...chunks);
    console.log(`Ingested ${chunks.length} chunks from ${file}`);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allChunks, null, 2), "utf-8");
  console.log(`\nWrote ${allChunks.length} total chunks to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
