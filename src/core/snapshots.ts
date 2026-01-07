import type { TimelineEvent, RenderState } from "./types";

export type StateSnapshot = {
  eventIndex: number;
  event: TimelineEvent;
  state: RenderState;
};
