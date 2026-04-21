export function normalizeTagName(input: string) {
  return input.trim().toLowerCase();
}

export function parseTagInput(input: string) {
  return [...new Set(input.split(",").map(normalizeTagName).filter(Boolean))];
}
