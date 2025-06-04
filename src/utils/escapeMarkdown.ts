export function escapeMarkdown(text: string): string {
  // Telegram's legacy Markdown mode only requires escaping
  // the following special characters: '_', '*', '`' and '['.
  return text.replace(/[_*`\[]/g, '\\$&');
}
