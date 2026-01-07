export type SchedulerConfig = {
  fps: number; // ej: 60
  charsPerSecond: number; // ej: 30
  switchFilePauseMs: number; // ej: 300
};

export const defaultSchedulerConfig: SchedulerConfig = {
  fps: 30,
  charsPerSecond: 60,
  switchFilePauseMs: 6000,
};

export type SchedulerState = {
  frame: number;
  activeFile: string | null;
  files: Record<string, string>;
  languages: Record<string, string>;
  highlightLines: Record<string, number[]>;
  transitionProgress: number;
  previousFile: string | null;
};
