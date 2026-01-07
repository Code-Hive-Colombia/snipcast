import type { ParsedSnippet, TimelineEvent } from "./types";

export function buildTimeline(snippet: ParsedSnippet): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  const lastContents: Record<string, string> = {};

  for (const file of snippet.files) {
    // Cambiar a archivo (tab)
    events.push({
      type: "switch-file",
      filename: file.filename,
      language: file.language,
    });

    // Insertar bloques secuencialmente
    for (const block of file.blocks) {
      const lastContent = lastContents[file.filename] || "";
      let delta = block.code;

      // Si el nuevo código empieza con el viejo, solo mandamos la diferencia
      if (block.code.startsWith(lastContent)) {
        delta = block.code.slice(lastContent.length);
      }

      if (delta.length > 0) {
        events.push({
          type: "insert-text",
          filename: file.filename,
          content: delta,
          highlightLines: block.highlightLines,
        });
      }

      lastContents[file.filename] = block.code;
    }
  }

  return events;
}
