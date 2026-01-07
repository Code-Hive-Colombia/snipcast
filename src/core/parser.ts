import fs from "fs-extra";
import matter from "gray-matter";
import { remark } from "remark";
import remarkParse from "remark-parse";
import type { Root, Code } from "mdast";
import type { FileBlock, ParsedSnippet } from "./types";
import { parseHighlightRanges } from "./highlight-parser";

export async function parseSnippet(filePath: string): Promise<ParsedSnippet> {
  const raw = await fs.readFile(filePath, "utf8");

  const { data: frontmatter, content } = matter(raw);

  const ast = remark().use(remarkParse).parse(content) as Root;

  const files: FileBlock[] = [];
  let themeCss: string | undefined = undefined;

  let currentFile: FileBlock | null = null;

  for (const node of ast.children) {
    if (node.type !== "code") continue;

    const codeNode = node as Code;

    const language = codeNode.lang ?? "text";
    const meta = codeNode.meta ?? "";

    const filenameMatch = meta.match(/filename=([^\s]+)/);
    const filename = filenameMatch?.[1];

    if (filename === "_theme.css") {
      themeCss = codeNode.value;
      continue;
    }

    // Parse highlight ranges if present
    const highlightMatch = meta.match(/highlight=\{([^}]+)\}/);
    const highlightLines = highlightMatch ? parseHighlightRanges(highlightMatch[1]!) : undefined;

    // Si viene filename explícito → nuevo archivo
    if (filename) {
      currentFile = {
        filename,
        language,
        blocks: [{ code: codeNode.value, highlightLines }],
      };
      files.push(currentFile);
      continue;
    }

    // Si NO hay filename → hereda
    if (!currentFile) {
      throw new Error("First code block must define a filename");
    }

    currentFile.blocks.push({
      code: codeNode.value,
      highlightLines,
    });
  }

  return {
    frontmatter,
    files,
    themeCss,
  };
}
