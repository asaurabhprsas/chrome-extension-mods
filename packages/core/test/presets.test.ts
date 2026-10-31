import { describe, it, expect } from "vitest";
import {
  calculateUntilTimestamp,
  formatDurationLabel,
  addPreset,
  removePreset,
  type TimerPreset
} from "../src/index.ts";

describe("presets logic", () => {
  it("formats duration labels correctly", () => {
    expect(formatDurationLabel(15)).toBe("15m");
    expect(formatDurationLabel(60)).toBe("1h");
    expect(formatDurationLabel(90)).toBe("1h 30m");
    expect(formatDurationLabel(150)).toBe("2h 30m");
  });

  it("calculates until timestamp accurately", () => {
    const fixedNow = 1700000000000;
    const minutes = 25;
    const expected = fixedNow + 25 * 60 * 1000;
    expect(calculateUntilTimestamp(minutes, fixedNow)).toBe(expected);
  });

  it("adds a new preset uniquely and sorts by duration", () => {
    const initial: TimerPreset[] = [
      { id: "p1", minutes: 30, label: "30m" }
    ];
    const updated = addPreset(initial, 15);
    expect(updated).toHaveLength(2);
    expect(updated[0].minutes).toBe(15);
    expect(updated[0].label).toBe("15m");
    expect(updated[1].minutes).toBe(30);

    // Adding existing minutes updates or ignores duplicate minutes
    const duplicate = addPreset(updated, 15);
    expect(duplicate).toHaveLength(2);
  });

  it("removes a preset by id", () => {
    const initial: TimerPreset[] = [
      { id: "p1", minutes: 15, label: "15m" },
      { id: "p2", minutes: 45, label: "45m" }
    ];
    const removed = removePreset(initial, "p1");
    expect(removed).toHaveLength(1);
    expect(removed[0].id).toBe("p2");
  });
});
