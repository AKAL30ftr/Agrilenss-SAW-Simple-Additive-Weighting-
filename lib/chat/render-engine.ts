/**
 * Strips markdown asterisks from message content for plain-text display.
 *
 * Applied in order:
 * 1. **bold** → bold (removes surrounding `**`)
 * 2. *italic* → italic (removes surrounding `*`)
 * 3. Any remaining lone `*` characters are removed entirely.
 */
export function renderMessageContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold: **teks** → teks
    .replace(/\*(.*?)\*/g, '$1')        // italic: *teks* → teks
    .replace(/\*/g, '');                // any remaining lone asterisk → remove
}
