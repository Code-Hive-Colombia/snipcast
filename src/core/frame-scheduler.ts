import type { TypingEvent } from "./typing-events";
import type { Frame } from "./frames";
import type { SchedulerConfig, SchedulerState } from "./scheduler-config";

export function scheduleFrames(
  events: TypingEvent[],
  config: SchedulerConfig
): Frame[] {
  const frames: Frame[] = [];

  const framesPerChar = Math.max(
    1,
    Math.round(config.fps / config.charsPerSecond)
  );

  // When charsPerSecond is greater than fps, we should emit multiple
  // characters per frame. charsPerFrame says how many characters to
  // consume for each rendered frame when typing is very fast.
  const charsPerFrame = Math.max(
    1,
    Math.round(config.charsPerSecond / config.fps)
  );

  let state: SchedulerState = {
    frame: 0,
    activeFile: null,
    files: {},
    languages: {},
    highlightLines: {},
    transitionProgress: 1,
    previousFile: null,
  };

  const pushFrame = () => {
    frames.push({
      frame: state.frame,
      activeFile: state.activeFile!,
      previousFile: state.previousFile,
      transitionProgress: state.transitionProgress,
      files: structuredClone(state.files),
      languages: structuredClone(state.languages),
      highlightLines: structuredClone(state.highlightLines),
    });
    state.frame++;
  };

  for (let idx = 0; idx < events.length; idx++) {
    const event = events[idx];
    if (!event) continue;

    // Update highlights from event if present
    if (event.highlightLines) {
      state.highlightLines[event.filename] = event.highlightLines;
    }

    // 1️⃣ Cambio de archivo
    if (event.type === "switch-file") {
      const prevFile = state.activeFile;
      const newFile = event.filename;

      state.files[newFile] ??= "";
      state.languages[newFile] = event.language;

      const totalPauseFrames = Math.round(
        (config.switchFilePauseMs / 1000) * config.fps
      );

      // We want to follow the user's requested rhythm:
      // Reading (prev visible) -> Fade Out (prev) -> Fade In (new)
      // Requested timings: 2s reading, 1s fade out, 0.5s fade in (total 3.5s)
      // We'll scale these if switchFilePauseMs is different.

      const fadeOutFrames = Math.round(config.fps * 1.0); // 1s
      const fadeInFrames = Math.round(config.fps * 0.5);  // 0.5s
      const minReadingFrames = Math.floor(totalPauseFrames * 0.2);

      let readingFrames = Math.max(minReadingFrames, totalPauseFrames - fadeOutFrames - fadeInFrames);

      // If the pause is too short, we scale linearly
      const actualTotal = readingFrames + fadeOutFrames + fadeInFrames;

      // If this is the very start of the video, we might want to skip "reading nothing"
      const startPause = state.frame === 0 ? Math.floor(readingFrames / 2) : readingFrames;

      for (let i = 0; i < actualTotal; i++) {
        state.previousFile = prevFile;
        state.activeFile = newFile;

        if (i < readingFrames) {
          // Phase 1: Reading (Old file fully visible)
          state.transitionProgress = 0;
        } else if (i < readingFrames + fadeOutFrames) {
          // Phase 2: Fade Out Old (0 to 0.5)
          const p = (i - readingFrames) / fadeOutFrames;
          state.transitionProgress = 0.5 * p;
        } else {
          // Phase 3: Fade In New (0.5 to 1.0)
          const p = (i - readingFrames - fadeOutFrames) / fadeInFrames;
          state.transitionProgress = 0.5 + 0.5 * p;
        }

        // Skip the initial reading phase if it's the very start of the video
        // so we don't start with 2 seconds of black screen.
        if (state.frame === 0 && i < readingFrames - startPause) {
          continue;
        }

        pushFrame();
      }

      // Cleanup post-transition
      state.transitionProgress = 1;
      state.previousFile = null;
      state.activeFile = newFile;

      continue;
    }

    // 2️⃣ Typing de carácter
    if (event.type === "type-char") {
      const file = event.filename;

      // If charsPerFrame === 1 we behave as before (one char per event).
      if (charsPerFrame === 1) {
        state.files[file] += event.char;

        for (let i = 0; i < framesPerChar; i++) pushFrame();
        continue;
      }

      // Batch up to `charsPerFrame` consecutive type-char events for the same file
      // so we can render multiple characters in a single frame when desired.
      let j = idx;
      let batch = "";
      while (
        j < events.length &&
        events[j]?.type === "type-char" &&
        events[j]?.filename === file &&
        batch.length < charsPerFrame
      ) {
        // @ts-ignore
        batch += events[j].char;
        j++;
      }

      state.files[file] += batch;

      for (let i = 0; i < framesPerChar; i++) pushFrame();

      // advance the outer loop to the last consumed event
      idx = j - 1;
    }
  }

  return frames;
}
