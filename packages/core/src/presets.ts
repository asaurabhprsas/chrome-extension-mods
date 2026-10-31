import type { TimerPreset } from "./types.js";

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (remMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remMinutes}m`;
}

export function calculateUntilTimestamp(minutes: number, now = Date.now()): number {
  return now + minutes * 60 * 1000;
}

export function addPreset(
  presets: TimerPreset[],
  minutes: number,
  customLabel?: string
): TimerPreset[] {
  const cleanMinutes = Math.max(1, Math.round(minutes));
  const existing = presets.find((p) => p.minutes === cleanMinutes);
  if (existing) {
    return presets;
  }

  const newPreset: TimerPreset = {
    id: `preset_${Date.now()}_${cleanMinutes}`,
    minutes: cleanMinutes,
    label: customLabel?.trim() || formatDurationLabel(cleanMinutes)
  };

  return [...presets, newPreset].sort((a, b) => a.minutes - b.minutes);
}

export function removePreset(presets: TimerPreset[], id: string): TimerPreset[] {
  return presets.filter((p) => p.id !== id);
}

export function getModStorageKey(modId: string): string {
  return `mod_settings_${modId}`;
}
