import { initialState } from "./state";
import { applyEvent } from "./reducer";
import type { TimelineEvent } from "./types";
import type { StateSnapshot } from "./snapshots";

export function simulateTimeline(events: TimelineEvent[]): StateSnapshot[] {
  const snapshots: StateSnapshot[] = [];

  let state = initialState;

  events.forEach((event, index) => {
    state = applyEvent(state, event);

    snapshots.push({
      eventIndex: index,
      event,
      state: structuredClone(state),
    });
  });

  return snapshots;
}
