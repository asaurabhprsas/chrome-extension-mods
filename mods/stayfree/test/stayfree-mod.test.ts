import { describe, it, expect } from "vitest";
import {
  calculateUntilTimestamp,
  addPreset,
  removePreset,
  type TimerPreset
} from "@chrome-mods/core";

describe("StayFree Mod Logic", () => {
  it("computes StayFree deactivation payload with until timestamp", () => {
    const fakeNow = 1700000000000;
    const durationMinutes = 45;
    const until = calculateUntilTimestamp(durationMinutes, fakeNow);

    const stayFreePayload = {
      until
    };

    expect(stayFreePayload.until).toBe(1700000000000 + 45 * 60 * 1000);
    // Verifies it conforms to StayFree condition: t < e.until
    expect(fakeNow < stayFreePayload.until).toBe(true);
  });

  it("manages user presets dynamically", () => {
    let presets: TimerPreset[] = [
      { id: "p1", minutes: 15, label: "15m" }
    ];

    // User adds 25m Pomodoro preset
    presets = addPreset(presets, 25, "25m (Pomodoro)");
    expect(presets).toHaveLength(2);
    expect(presets[1].label).toBe("25m (Pomodoro)");
    expect(presets[1].minutes).toBe(25);

    // User deletes 15m preset
    presets = removePreset(presets, "p1");
    expect(presets).toHaveLength(1);
    expect(presets[0].minutes).toBe(25);
  });
});
