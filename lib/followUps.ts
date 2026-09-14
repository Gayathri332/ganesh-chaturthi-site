/**
 * Contextual "suggested question" chips for the Ask Ganapati widget.
 *
 * This is a lightweight, fully offline topic matcher — it looks at the
 * question just asked (plus the answer text) and picks a bundle of
 * related follow-up questions, e.g. asking about the elephant head
 * surfaces "tell me the full story" / "why did Shiva behead him?"
 * instead of the same four generic starter prompts every time.
 *
 * generateFollowUps() in lib/llm.ts can produce sharper, fully dynamic
 * follow-ups when an LLM key is configured — this file is the reliable
 * fallback (and the only source when no key is set).
 */

interface Topic {
  id: string;
  keywords: string[];
  followUps: string[];
}

const TOPICS: Topic[] = [
  {
    id: "elephant_head",
    keywords: ["elephant head", "elephant-headed", "gajanana", "trunk", "beheaded"],
    followUps: [
      "Tell me the full story of how Ganesha got his elephant head",
      "Why did Shiva behead his own son?",
      "Why is Ganesha also called Gajanana?",
      "What does Ganesha's elephant head symbolise?",
    ],
  },
  {
    id: "modak",
    keywords: ["modak", "sweet", "favourite sweet", "favorite sweet", "laddoo"],
    followUps: [
      "Why is Ganesha called Modakapriya?",
      "What other foods are offered to Ganesha?",
      "What is the story of the moon laughing at Ganesha's belly full of modaks?",
      "Why do devotees offer 21 modaks during Ganesh Chaturthi?",
    ],
  },
  {
    id: "parents",
    keywords: ["parvati", "shiva", "parents", "mother", "father", "born"],
    followUps: [
      "How was Ganesha born, according to the stories?",
      "Who are Ganesha's brother and sisters?",
      "What is the story of Ganesha guarding Parvati's door?",
      "Why did Shiva behead his own son?",
    ],
  },
  {
    id: "ganesh_chaturthi",
    keywords: ["ganesh chaturthi", "festival", "visarjan", "immersion", "celebrate", "celebration"],
    followUps: [
      "What happens during Ganesh Visarjan?",
      "How long does the Ganesh Chaturthi festival last?",
      "What is the significance of Anant Chaturdashi?",
      "How did public Ganesh Chaturthi celebrations begin?",
    ],
  },
  {
    id: "mouse_vahana",
    keywords: ["mouse", "mushika", "rat", "vahana", "rides a mouse"],
    followUps: [
      "Why does Ganesha ride a tiny mouse despite his large size?",
      "What is the story of the mouse Mushika?",
      "Which animals do Ganesha's eight forms ride?",
      "What does the mouse symbolise spiritually?",
    ],
  },
  {
    id: "broken_tusk",
    keywords: ["tusk", "ekadanta", "broken", "vyasa", "mahabharata", "writing"],
    followUps: [
      "How did Ganesha break his tusk?",
      "Why is Ganesha called Ekadanta?",
      "What role did Ganesha play in writing the Mahabharata?",
      "What did Ganesha do with his broken tusk afterwards?",
    ],
  },
  {
    id: "eight_forms",
    keywords: [
      "vakratunda", "ekadanta", "mahodara", "gajanana", "lambodara",
      "vikata", "vighnaraja", "dhumravarna", "eight forms", "ashtavinayak", "avatar",
    ],
    followUps: [
      "What demon did each of Ganesha's eight forms defeat?",
      "Why does Ganesha take eight different forms?",
      "Where are the real Ashtavinayak temples located?",
      "What does Vighnaraja's serpent throne represent?",
    ],
  },
  {
    id: "remover_of_obstacles",
    keywords: ["obstacle", "vighnaharta", "vighnesh", "remover", "first god"],
    followUps: [
      "Why is Ganesha worshipped before starting anything new?",
      "What does 'Vighnaharta' mean?",
      "Does Ganesha ever place obstacles as well as remove them?",
      "Why is Ganesha prayed to first, before other gods?",
    ],
  },
  {
    id: "moon_curse",
    keywords: ["moon", "curse", "chandra", "belly", "fell off"],
    followUps: [
      "Why did Ganesha curse the moon?",
      "Why should you avoid looking at the moon on Ganesh Chaturthi?",
      "How was the moon's curse eventually softened?",
      "What happened to Ganesha's belly in this story?",
    ],
  },
  {
    id: "family",
    keywords: ["riddhi", "siddhi", "shubh", "labh", "wife", "wives", "sons", "race around the world"],
    followUps: [
      "Who are Riddhi and Siddhi?",
      "What do Shubh and Labh represent?",
      "How did Ganesha win the race around the world?",
      "Why did Ganesha circle his parents instead of the world?",
    ],
  },
  {
    id: "worship",
    keywords: ["aarti", "puja", "worship", "pray", "mantra", "offering"],
    followUps: [
      "What is the meaning of the Ganesh aarti?",
      "What offerings are traditionally made during Ganesha puja?",
      "Is there a simple mantra to chant to Ganesha?",
      "Which flowers and leaves are offered to Ganesha?",
    ],
  },
];

const GENERIC_POOL = [
  "Why does Ganesha have an elephant head?",
  "What is Ganesh Chaturthi?",
  "Why is the modak Ganesha's favourite sweet?",
  "Who are Ganesha's parents?",
  "Why does Ganesha ride a mouse?",
  "What is the story of Ganesha's broken tusk?",
  "Why is Ganesha worshipped before other gods?",
  "What do Ganesha's eight forms represent?",
];

function normalize(s: string) {
  return s.toLowerCase();
}

/**
 * Picks up to `count` contextual follow-up questions given the question
 * just asked (and, optionally, the answer text for extra signal), while
 * excluding anything already asked in this conversation.
 */
export function getFollowUps(
  question: string,
  answer: string,
  askedQuestions: string[] = [],
  count = 4
): string[] {
  const haystack = normalize(`${question} ${answer}`);
  const asked = new Set(askedQuestions.map((q) => normalize(q.trim())));
  asked.add(normalize(question.trim()));

  const scored = TOPICS.map((topic) => {
    const score = topic.keywords.reduce(
      (acc, kw) => acc + (haystack.includes(kw) ? 1 : 0),
      0
    );
    return { topic, score };
  })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked: string[] = [];
  const pushUnique = (candidates: string[]) => {
    for (const c of candidates) {
      if (picked.length >= count) break;
      if (asked.has(normalize(c.trim()))) continue;
      if (picked.some((p) => normalize(p) === normalize(c))) continue;
      picked.push(c);
    }
  };

  for (const { topic } of scored) {
    pushUnique(topic.followUps);
    if (picked.length >= count) break;
  }

  if (picked.length < count) {
    pushUnique(GENERIC_POOL);
  }

  return picked.slice(0, count);
}
