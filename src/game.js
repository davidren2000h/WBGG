// Answer normalization & scoring (PRD §6.2, §6.3).

// Strip Wikipedia-style trailing disambiguator: "Paris (Texas)" -> "Paris"
// and remove punctuation, lowercase, collapse spaces.
export function normalize(text) {
  if (!text) return '';
  let s = String(text);
  // Remove parenthesized chunks: ASCII () and full-width （）.
  s = s.replace(/\s*[\(（][^\)）]*[\)）]/g, ' ');
  // Lowercase (no-op for CJK).
  s = s.toLowerCase();
  // Drop punctuation (keep letters, digits, CJK).
  s = s.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  // Collapse whitespace.
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export function isCorrect(input, answer) {
  const a = normalize(input);
  const b = normalize(answer);
  if (!a || !b) return false;
  return a === b;
}

// Scoring table (PRD §6.3).
export const SCORE = {
  CORRECT_FIRST: 100,
  CORRECT_AFTER_HINT: 50,
  WRONG: -10
};

// First character of the answer, ignoring leading parenthetical noise.
export function firstCharHint(answer) {
  const cleaned = answer.replace(/^[\s\(（"'《]+/, '');
  return cleaned ? cleaned[0] : '';
}
