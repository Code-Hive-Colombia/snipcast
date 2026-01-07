export type Frame = {
  frame: number;
  activeFile: string;
  files: Record<string, string>;
  languages: Record<string, string>; // filename -> language
  highlightLines?: Record<string, number[]>; // filename -> line numbers to highlight
  transitionProgress?: number; // 0 to 1
  previousFile?: string | null;
};
