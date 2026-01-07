import { createHighlighter as getHighlighter } from "shiki";

export async function createHighlighter(theme: "dark" | "light") {
  return getHighlighter({
    themes: [theme === "dark" ? "rose-pine" : "rose-pine-dawn"],
    langs: ["typescript", "json", "javascript", "tsx", "jsx", "css", "html"],
  });
}
