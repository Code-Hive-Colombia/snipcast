import path from "path";
import {
  ensureBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import type { Frame } from "../core/frames";
import { bundle } from "@remotion/bundler";
import type { Ora } from "ora";

export type RenderConfig = {
  fps: number;
  width: number;
  height: number;
  theme: string;
  font?: string;
  highlightLines?: number[];
  browserExecutable?: string;
  imageFileName?: string;
  themeCss?: string;
};

import { fileURLToPath } from "url";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function renderWithRemotion(
  frames: Frame[],
  outFile: string,
  config: RenderConfig,
  spinner: Ora
) {
  const baseText = spinner.text;

  // Resolve Remotion entry point
  // 1. In dist folder (when running bundled/installed globally)
  // 2. In src folder (when running dev)
  const prodPath = path.resolve(__dirname, "remotion/index.ts");
  const devPath = path.resolve(__dirname, "../remotion/index.ts"); // relative to src/render

  const entryPoint = fs.existsSync(prodPath) ? prodPath : devPath;

  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Could not find Remotion entry point at ${entryPoint}`);
  }

  const browserExecutable = config.browserExecutable || "chrome-headless-shell/linux/chs";

  await ensureBrowser({
    onBrowserDownload: () => {
      return {
        version: "134.0.6998.35",
        onProgress: ({ percent }) => {
          spinner.text = `Browser download: ${Math.round(
            percent * 100
          )}% downloaded`;
        },
      };
    },
    browserExecutable: config.browserExecutable,
  });

  spinner.text = baseText;

  const serveUrl = await bundle({ entryPoint });
  const compositionId = "CodeVideo";

  const inputProps = {
    frames,
    config,
  };

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    browserExecutable: config.browserExecutable,
    inputProps,
  });

  if (config.imageFileName) {
    spinner.text = `Rendering image for ${config.imageFileName}`;

    // Find the last frame where the requested file is active
    // If not found, use the last frame
    let frameIndex = Math.max(0, frames.length - 1);
    for (let i = frames.length - 1; i >= 0; i--) {
      const f = frames[i];
      if (f && f.activeFile === config.imageFileName) {
        frameIndex = i;
        break;
      }
    }

    // @ts-ignore
    await renderStill({
      composition: {
        ...composition,
        durationInFrames: frames.length,
        fps: config.fps,
        width: config.width,
        height: config.height,
      },
      serveUrl,
      output: outFile,
      inputProps,
      frame: frameIndex,
      browserExecutable: config.browserExecutable,
    });
    return;
  }

  await renderMedia({
    onProgress: ({ progress }) => {
      spinner.text = `Encoding: ${Math.round(progress * 100)}% progress`;
    },
    composition: {
      ...composition,
      durationInFrames: frames.length,
      fps: config.fps,
      width: config.width,
      height: config.height,
    },
    serveUrl: serveUrl,
    codec: "h264",
    outputLocation: outFile,
    browserExecutable: config.browserExecutable,
    inputProps,
  });
}
