#!/usr/bin/env node
import { Command } from "commander";
import { renderCommand, renderSnippetAction } from "./commands/render";

const program = new Command("snipcast");

program
  .name("snipcast")
  .description("Markdown → animated code videos")
  .version("0.0.1")
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

program.addCommand(renderCommand);

program.parse(process.argv);
