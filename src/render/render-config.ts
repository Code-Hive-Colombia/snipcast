export type RenderConfig = {
  width: number;
  height: number;
  padding: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: "dark" | "light";
  background: string;
};

export const defaultRenderConfig: RenderConfig = {
  width: 1280,
  height: 720,
  padding: 64,
  fontSize: 28,
  lineHeight: 1.5,
  fontFamily: "Maple Mono",
  theme: "dark",
  background: "#0f111a",
};
