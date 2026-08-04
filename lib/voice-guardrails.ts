// ---------------------------------------------------------------------------
// Deterministic guardrails, applied BEFORE the model is called.
//
// A prompt instruction is a request; this is a rule. The YouTube redirect and
// the personal-compensation refusal must hold under jailbreak attempts, high
// temperature, and the Gemini/Anthropic provider swap — so they are answered
// in code, with the model never seeing the turn.
// ---------------------------------------------------------------------------

export type Interception = { reply: string; reason: string };

const YOUTUBE_RE =
  /\b(you\s*tube|youtube|yt channel|your channel|subscriber|subscribers|silver play|play button|vlog|video content|channel (about|topic|niche|content))\b/i;

// Personal compensation is off-limits; SERVICE pricing is fine ("how much
// does he charge" must still reach the model). So this matches earning verbs
// and comp nouns, with any subject in between — not "charge"/"cost"/"rate".
const SALARY_RE =
  /\b(salary|salaries|his pay\b|your pay\b|net worth|compensation|ctc|take[- ]home)\b|\bhow much (?:do|does|did)\s+\w*\s*(?:earn|make|get paid|paid)\b|\bwhat (?:do|does|did)\s+\w*\s*(?:earn|make)\b/i;

const PERSONAL_RE =
  /\b(wife|girlfriend|married|marriage|family|kids|children|religion|dating|his age|how old is he)\b/i;

const YOUTUBE_REPLY =
  "He built and scaled a YouTube channel past 500,000 subscribers and holds a Silver Play Button — proof of content systems and algorithm skill. That's the whole story there. What matters here is the engineering: eight production AI systems, and campaign results to match. Which would you like to see?";

const SALARY_REPLY =
  "Personal compensation isn't something I discuss. Engagement scope and rates for a project are a different matter — best covered directly. Shall I point you to his calendar?";

const PERSONAL_REPLY =
  "I keep to Hammad's work rather than his private life. Ask me about the systems he's built or the results they produced — that's where I'm useful.";

/**
 * Returns a canned reply when a turn hits a hard rule, or null to let the
 * model answer. Checked against the newest user message only.
 */
export function intercept(userMessage: string): Interception | null {
  const t = userMessage.slice(0, 500);
  if (YOUTUBE_RE.test(t)) return { reply: YOUTUBE_REPLY, reason: "youtube" };
  if (SALARY_RE.test(t)) return { reply: SALARY_REPLY, reason: "salary" };
  if (PERSONAL_RE.test(t)) return { reply: PERSONAL_REPLY, reason: "personal" };
  return null;
}
