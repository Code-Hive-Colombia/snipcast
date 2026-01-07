export type TypingEvent =
  | {
    type: "switch-file";
    filename: string;
    language: string;
    highlightLines?: number[];
  }
  | {
    type: "type-char";
    filename: string;
    char: string;
    highlightLines?: number[];
  };
