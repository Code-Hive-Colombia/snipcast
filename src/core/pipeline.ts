import type { ParsedSnippet } from "./types";
import type { Frame } from "./frames";
import type { SchedulerConfig } from "./scheduler-config";
import { buildTimeline } from "./timeline";
import { simulateTimeline } from "./simulator";
import { generateTypingEvents } from "./typing";
import { scheduleFrames } from "./frame-scheduler";

/**
 * Main pipeline: converts a parsed snippet into renderable frames.
 * 
 * This consolidates the multi-step process into a single, easy-to-use function:
 * ParsedSnippet → Timeline → Snapshots → TypingEvents → Frames
 */
export function snippetToFrames(
    snippet: ParsedSnippet,
    config: SchedulerConfig
): Frame[] {
    const timeline = buildTimeline(snippet);
    const snapshots = simulateTimeline(timeline);
    const typingEvents = generateTypingEvents(snapshots);
    const frames = scheduleFrames(typingEvents, config);

    return frames;
}
