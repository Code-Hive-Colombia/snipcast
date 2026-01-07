import { Composition } from "remotion";
import { CodeVideo } from "./CodeFrame";
import type { Frame } from "../core/frames";

type RenderConfig = {
  fps: number;
  width: number;
  height: number;
  theme: string;
  font?: string;
};

type Props = {
  frames: Frame[];
  config: RenderConfig;
};

export const CodeComposition: React.FC = () => {
  // Props are injected by the renderer via inputProps
  // The composition metadata (fps, width, height) is set dynamically
  return (
    <Composition
      id="CodeVideo"
      component={CodeVideo}
      durationInFrames={1} // Overridden by renderer
      fps={30} // Overridden by renderer
      width={1920} // Overridden by renderer
      height={1080} // Overridden by renderer
      defaultProps={{ frames: [], config: { fps: 30, width: 1920, height: 1080, theme: "github-dark" } }}
    />
  );
};
