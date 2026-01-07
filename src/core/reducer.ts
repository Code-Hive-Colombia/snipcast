import type { RenderState, TimelineEvent } from "./types";

export function applyEvent(
  state: RenderState,
  event: TimelineEvent
): RenderState {
  switch (event.type) {
    case "switch-file": {
      return {
        ...state,
        activeFile: event.filename,
        files: {
          ...state.files,
          [event.filename]: state.files[event.filename] ?? "",
        },
        languages: {
          ...state.languages,
          [event.filename]: event.language,
        },
        highlightLines: {
          ...state.highlightLines,
          [event.filename]: event.highlightLines ?? state.highlightLines[event.filename] ?? [],
        }
      };
    }

    case "insert-text": {
      const prev = state.files[event.filename] ?? "";

      // If the incoming block looks like a full-file snapshot (it starts
      // with the previous content), treat it as a replacement rather than
      // blindly appending. This avoids duplicating code when authors include
      // previous lines in the next block.
      const nextContent = event.content.startsWith(prev)
        ? event.content
        : (prev.length > 0 && !prev.endsWith("\n") ? prev + "\n" + event.content : prev + event.content);

      return {
        ...state,
        files: {
          ...state.files,
          [event.filename]: nextContent,
        },
        highlightLines: {
          ...state.highlightLines,
          [event.filename]: event.highlightLines ?? [],
        }
      };
    }

    default:
      return state;
  }
}
