export type TimelineEvent = SwitchFileEvent | InsertTextEvent;

export type SwitchFileEvent = {
  type: "switch-file";
  filename: string;
  language: string;
  highlightLines?: number[];
};

export type InsertTextEvent = {
  type: "insert-text";
  filename: string;
  content: string;
  highlightLines?: number[];
};

export type RenderState = {
  activeFile: string | null;
  files: Record<string, string>; // filename → current content
  languages: Record<string, string>; // filename → language
  highlightLines: Record<string, number[]>; // filename → line numbers to highlight
};

export type FileBlock = {
  filename: string;
  language: string;
  blocks: { code: string; highlightLines?: number[] }[];
};

export type ParsedSnippet = {
  frontmatter: Record<string, any>;
  files: FileBlock[];
  themeCss?: string;
};

export type SnippetConfig = {
  fps?: number;
  chars_per_second?: number;
  width?: number;
  height?: number;
  font?: string;
  theme?: string;
  switch_file_pause_ms?: number;
};

export type StateSnapshot = {
  eventIndex: number;
  event: TimelineEvent;
  state: RenderState;
};
