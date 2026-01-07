export function diffInsertedText(previous: string, next: string): string {
  if (!next.startsWith(previous)) {
    throw new Error("Non-linear text change detected");
  }

  return next.slice(previous.length);
}
