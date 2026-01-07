import type { StateSnapshot } from "./snapshots";
import type { TypingEvent } from "./typing-events";
import { diffInsertedText } from "./diff";

export function generateTypingEvents(
  snapshots: StateSnapshot[],
): TypingEvent[] {
  const events: TypingEvent[] = [];

  let previousState: StateSnapshot["state"] | null = null;
  const materializedFiles = new Set<string>();

  for (const snapshot of snapshots) {
    const { event, state } = snapshot;

    if (event.type === "switch-file") {
      events.push({
        type: "switch-file",
        filename: event.filename,
        language: event.language,
        highlightLines: state.highlightLines[event.filename],
      });

      previousState = state;
      continue;
    }

    if (event.type === "insert-text") {
      if (!previousState) {
        previousState = state;
        continue;
      }

      const filename = event.filename;
      const beforeExists = Object.prototype.hasOwnProperty.call(
        previousState.files,
        filename,
      );
      const before = beforeExists ? previousState.files[filename] : undefined;
      const after = state.files[filename] ?? "";

      const wasMaterialized = materializedFiles.has(filename);

      // 🟢 Caso 1: primera vez que el archivo aparece con contenido
      if (!wasMaterialized && !beforeExists && after.length > 0) {
        materializedFiles.add(filename);

        for (const char of after) {
          events.push({
            type: "type-char",
            filename,
            char,
            highlightLines: state.highlightLines[filename],
          });
        }

        previousState = state;
        continue;
      }

      // 🟢 Caso 2: edición incremental normal
      if (after.length > (before ?? "").length) {
        const inserted = diffInsertedText(before ?? "", after);

        for (const char of inserted) {
          events.push({
            type: "type-char",
            filename,
            char,
            highlightLines: state.highlightLines[filename],
          });
        }
      }
    }

    previousState = state;
  }

  return events;
}
