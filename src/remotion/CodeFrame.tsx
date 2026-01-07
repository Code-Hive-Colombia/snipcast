import React, { useMemo, useState, useEffect } from "react";
import { useCurrentFrame, delayRender, continueRender } from "remotion";
import type { Frame } from "../core/frames";
import { createHighlighter } from "shiki";

type RenderConfig = {
  fps: number;
  width: number;
  height: number;
  theme: string;
  font?: string;
  highlightLines?: number[]; // Line numbers to highlight
  themeCss?: string;
};

type Props = {
  frames: Frame[];
  config: RenderConfig;
};

let highlighterInstance: any = null;
let highlighterPromise: Promise<any> | null = null;

function getHighlighter(theme: string) {
  if (highlighterInstance) return Promise.resolve(highlighterInstance);
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = createHighlighter({
    themes: [theme, "github-dark", "rose-pine"],
    langs: ["typescript", "json", "javascript", "tsx", "jsx", "css", "html", "python", "rust", "go", "bash", "markdown"],
  }).then(h => {
    highlighterInstance = h;
    return h;
  });

  return highlighterPromise;
}

export const CodeVideo: React.FC<Props> = ({ frames, config }) => {
  const frameIndex = useCurrentFrame();
  const frame = frames[Math.min(frameIndex, frames.length - 1)];

  const [highlighter, setHighlighter] = useState<any>(null);
  const [handle] = useState(() => delayRender("Loading Shiki"));
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getHighlighter(config.theme).then((h) => {
      setHighlighter(h);
      continueRender(handle);
    });
  }, [config.theme]);

  // Handle dynamic language loading
  useEffect(() => {
    if (!highlighter) return;

    const neededLangs = new Set<string>();
    for (const f of frames) {
      Object.values(f.languages).forEach(l => neededLangs.add(l));
    }

    const loadedLangs = highlighter.getLoadedLanguages();
    const toLoad = Array.from(neededLangs).filter(l => !loadedLangs.includes(l));

    if (toLoad.length > 0) {
      const h = delayRender("Loading custom languages");
      Promise.all(toLoad.map(l => highlighter.loadLanguage(l))).finally(() => {
        continueRender(h);
      });
    }
  }, [highlighter, frames]);

  const filenames = useMemo(() => {
    const s = new Set<string>();
    for (const f of frames) {
      Object.keys(f.files).forEach((k) => s.add(k));
    }
    return Array.from(s);
  }, [frames]);

  const activeFile = frame?.activeFile ?? filenames[0] ?? null;
  const previousFile = frame?.previousFile ?? null;
  const transitionProgress = frame?.transitionProgress ?? 1;

  // UI (Tabs/Header) follow previous file until it fades out completely (0.5)
  const uiActiveFile = (previousFile && transitionProgress < 0.5) ? previousFile : activeFile;

  const getTokens = (file: string | null) => {
    const fileCode = frame ? frame.files[file ?? ""] ?? "" : "";
    if (!highlighter || !fileCode) return [];

    const lang = frame?.languages[file ?? ""] ?? "typescript";

    return highlighter.codeToTokens(fileCode, {
      lang,
      theme: config.theme,
    }).tokens;
  };

  const tokens = useMemo(() => getTokens(activeFile), [highlighter, activeFile, frame?.files[activeFile ?? ""], config.theme]);
  const previousTokens = useMemo(() => {
    if (transitionProgress < 1 && previousFile) {
      return getTokens(previousFile);
    }
    return [];
  }, [highlighter, previousFile, frame?.files[previousFile ?? ""], transitionProgress, config.theme]);

  // Auto-scroll logic: Follow the dominant file's caret
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Transition stages:
    // 0.0 -> Reading prev file
    // 0.0 -> 0.5 -> Fading out prev file
    // 0.5 -> 1.0 -> Fading in active file

    // We follow previous file's tokens if we are in Reading or Fade Out stage.
    const isFadingOutOld = previousFile && transitionProgress < 0.5;
    const scrollTokens = isFadingOutOld ? previousTokens : tokens;

    const lineHeightPx = 30;
    const lines = scrollTokens.length;

    if (lines === 0) {
      el.scrollTop = 0;
      return;
    }

    const caret = Math.max(0, lines - 1);
    const containerHeight = el.clientHeight;
    const target = caret * lineHeightPx - containerHeight / 2 + lineHeightPx / 2;

    el.scrollTop = Math.max(0, target);
  }, [tokens, previousTokens, frameIndex, transitionProgress, previousFile]);

  const renderCodeBlock = (file: string | null, blockTokens: any[][]) => {
    if (!file) return null;

    return (
      <pre
        style={{
          margin: 0,
          fontSize: 20,
          lineHeight: "30px",
          whiteSpace: "pre-wrap",
        }}
      >
        {blockTokens.map((line: any[], i: number) => {
          const lineNumber = i + 1;
          const frameHighlights = frame?.highlightLines?.[file ?? ""] ?? [];
          const highlightSet = new Set(frameHighlights);
          const isHighlighted = highlightSet.has(lineNumber);
          const prevHighlighted = highlightSet.has(lineNumber - 1);
          const nextHighlighted = highlightSet.has(lineNumber + 1);

          return (
            <div
              key={i}
              className={`cc-code-line ${isHighlighted ? "cc-highlight-line" : ""}`}
              style={{
                display: "block",
                position: "relative",
                padding: isHighlighted ? "4px 12px" : "0",
                marginTop: isHighlighted && !prevHighlighted ? "4px" : "0",
                marginBottom: isHighlighted && !nextHighlighted ? "4px" : "0",
                marginLeft: isHighlighted ? "-12px" : "0",
                marginRight: isHighlighted ? "-12px" : "0",

                borderTopLeftRadius: isHighlighted && !prevHighlighted ? "8px" : "0",
                borderTopRightRadius: isHighlighted && !prevHighlighted ? "8px" : "0",
                borderBottomLeftRadius: isHighlighted && !nextHighlighted ? "8px" : "0",
                borderBottomRightRadius: isHighlighted && !nextHighlighted ? "8px" : "0",

                background: isHighlighted
                  ? "linear-gradient(90deg, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.1) 100%)"
                  : "transparent",

                borderTop: isHighlighted && !prevHighlighted ? "1px solid rgba(139, 92, 246, 0.3)" : "none",
                borderBottom: isHighlighted && !nextHighlighted ? "1px solid rgba(139, 92, 246, 0.3)" : "none",
                borderLeft: isHighlighted ? "1px solid rgba(139, 92, 246, 0.3)" : "none",
                borderRight: isHighlighted ? "1px solid rgba(139, 92, 246, 0.3)" : "none",

                boxShadow: isHighlighted && !prevHighlighted
                  ? "0 4px 12px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                  : "none",

                transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1)",
                zIndex: isHighlighted ? 1 : 0,
              }}
            >
              {line.map((token: any, j: number) => (
                <span key={j} style={{ color: token.color }}>
                  {token.content}
                </span>
              ))}
            </div>
          );
        })}
      </pre>
    );
  };

  // Phase-Based Opacity logic
  // Progress 0.0 -> Reading (Old 100%, New 0%)
  // Progress 0.0 to 0.5 -> Fade Out (Old 100% to 0%, New 0%)
  // Progress 0.5 to 1.0 -> Fade In (Old 0%, New 0% to 100%)

  let prevOpacity = 0;
  let activeOpacity = 1;

  if (previousFile && transitionProgress < 1) {
    if (transitionProgress === 0) {
      prevOpacity = 1;
      activeOpacity = 0;
    } else if (transitionProgress < 0.5) {
      // Fade out old: mapped from (0 to 0.5) to opacity (1 to 0)
      prevOpacity = 1 - (transitionProgress / 0.5);
      activeOpacity = 0;
    } else {
      // Fade in new: mapped from (0.5 to 1.0) to opacity (0 to 1)
      prevOpacity = 0;
      activeOpacity = (transitionProgress - 0.5) / 0.5;
    }
  }

  const themeStyle = useMemo(() => {
    if (!config.themeCss) return null;
    return <style dangerouslySetInnerHTML={{ __html: config.themeCss }} />;
  }, [config.themeCss]);

  return (
    <div
      className="cc-container"
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1419 100%)",
        padding: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: config.font ? `"${config.font}", monospace` : "Maple Mono, monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {themeStyle}
      {/* Decorative radial behind card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "98%",
            maxWidth: 1600,
            height: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: 28,
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.04), transparent)",
              filter: "blur(48px)",
              opacity: 0.08,
            }}
          />
        </div>
      </div>

      <div
        style={{
          width: "98%",
          maxWidth: 1600,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tabs */}
        <div
          className="cc-tab-bar"
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            padding: "8px 12px",
            background: "rgba(0,0,0,0.25)",
            borderRadius: 12,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          {filenames.map((name) => {
            const isActive = name === uiActiveFile;
            return (
              <div
                key={name}
                className={`cc-tab ${isActive ? "cc-tab-active" : ""}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: isActive
                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)"
                    : "transparent",
                  color: isActive ? "#e0e7ff" : "#94a3b8",
                  border: isActive ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "none",
                  transform: isActive ? "translateY(-1px)" : "none",
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: "0.01em",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {name}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div
          className="cc-card"
          style={{
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
            background: "linear-gradient(145deg, #1a1f2e 0%, #151a27 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            height: "78vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="cc-header"
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 6,
                  background: "#ff5f56",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 6,
                  background: "#ffbd2e",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 6,
                  background: "#27c93f",
                }}
              />
            </div>
            <div style={{ color: "#9aa4b2", fontSize: 13 }}>{uiActiveFile}</div>
          </div>

          {/* Code area */}
          <div
            className="cc-code-area"
            style={{ padding: 32, flex: 1, minHeight: 0, overflow: "auto", position: "relative" }} ref={scrollRef}>
            <div style={{
              opacity: activeOpacity,
              transform: `translateY(${10 * (1 - activeOpacity)}px)`,
            }}>
              {renderCodeBlock(activeFile, tokens)}
            </div>

            {previousFile && transitionProgress < 1 && (
              <div style={{
                position: "absolute",
                top: 32,
                left: 32,
                right: 32,
                pointerEvents: "none",
                opacity: prevOpacity,
                transform: `translateY(${-10 * (1 - prevOpacity)}px)`,
              }}>
                {renderCodeBlock(previousFile, previousTokens)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
