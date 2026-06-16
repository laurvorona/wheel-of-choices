/** Split pasted or imported text into individual option labels. */
export function parseListInput(text: string): string[] {
  return text
    .split(/[\r\n,]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
