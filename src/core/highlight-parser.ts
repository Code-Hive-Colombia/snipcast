/**
 * Parse highlight syntax like "2,4-6,8" into an array of line numbers
 * Example: "2,4-6,8" => [2, 4, 5, 6, 8]
 */
export function parseHighlightRanges(highlightStr: string): number[] {
    const lines = new Set<number>();

    const parts = highlightStr.split(',').map(p => p.trim());

    for (const part of parts) {
        if (part.includes('-')) {
            // Range like "4-6"
            const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    lines.add(i);
                }
            }
        } else {
            // Single number like "2"
            const num = parseInt(part, 10);
            if (!isNaN(num)) {
                lines.add(num);
            }
        }
    }

    return Array.from(lines).sort((a, b) => a - b);
}
