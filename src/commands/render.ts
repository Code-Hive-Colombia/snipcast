import { Command } from "commander";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { parseSnippet } from "../core/parser";
import { buildTimeline } from "../core/timeline";
import { simulateTimeline } from "../core/simulator";
import { generateTypingEvents } from "../core/typing";
import { scheduleFrames } from "../core/frame-scheduler";
import { defaultSchedulerConfig } from "../core/scheduler-config";
import { renderWithRemotion } from "../render/remotion-renderer";
import type { SnippetConfig } from "../core/types";
import { snippetToFrames } from "../core/pipeline";

export async function renderSnippetAction(file: string, options: any) {
  const spinner = ora("Parsing snippet").start();

  const inputPath = path.resolve(file);

  if (!(await fs.pathExists(inputPath))) {
    spinner.fail("File not found");
    process.exit(1);
  }

  try {
    const snippet = await parseSnippet(inputPath);

    // Extract config from frontmatter
    const fmConfig: SnippetConfig = {
      fps: snippet.frontmatter.fps,
      chars_per_second: snippet.frontmatter.chars_per_second,
      width: snippet.frontmatter.width,
      height: snippet.frontmatter.height,
      font: snippet.frontmatter.font,
      theme: snippet.frontmatter.theme,
      switch_file_pause_ms: snippet.frontmatter.switch_file_pause_ms,
    };

    // Merge config: CLI > Frontmatter > Defaults
    const fps = options.fps ?? fmConfig.fps ?? 30;
    const cps = options.cps ?? fmConfig.chars_per_second ?? 60;
    const width = options.width ?? fmConfig.width ?? 1920;
    const height = options.height ?? fmConfig.height ?? 1080;
    const theme = options.theme ?? fmConfig.theme ?? "github-dark";
    const font = options.font ?? fmConfig.font;
    const switchFilePauseMs = fmConfig.switch_file_pause_ms ?? 1000;

    const config = {
      ...defaultSchedulerConfig,
      fps,
      charsPerSecond: cps,
      switchFilePauseMs,
    };

    spinner.text = "Generating frames";
    const frames = snippetToFrames(snippet, config);

    spinner.text = options.image ? "Rendering image" : "Rendering with Remotion";
    const out = options.image && options.out === "output.mp4" ? "output.png" : options.out;

    await renderWithRemotion(frames, out, {
      fps,
      width,
      height,
      theme,
      font,
      themeCss: snippet.themeCss,
      browserExecutable: options.browserExecutable,
      imageFileName: options.image ? (options.imageFileName ?? frames[frames.length - 1]?.activeFile) : undefined,
    }, spinner);

    spinner.succeed(`${options.image ? "Image" : "Video"} saved: ${out}`);
  } catch (err) {
    spinner.fail("Failed to render");
    console.error(err);
    process.exit(1);
  }
}

export const renderCommand = new Command("render")
  .description("Render a markdown snippet to video")
  .argument("<file>", "Markdown snippet file")
  .option("-o, --out <file>", "Output file", "output.mp4")
  .option("--fps <number>", "Frames per second", parseInt)
  .option("--width <number>", "Video width", parseInt)
  .option("--height <number>", "Video height", parseInt)
  .option("--cps <number>", "Characters per second", parseInt)
  .option("--theme <name>", "Syntax theme")
  .option("--font <path>", "Custom font path")
  .option("--browser-executable <path>", "Custom browser executable path")
  .option("--image", "Render a static image instead of video")
  .option("--image-file-name <name>", "Specific file to render in the image")
  .action(renderSnippetAction);
