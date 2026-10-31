export interface TimerPreset {
  id: string;
  minutes: number;
  label: string;
}

export interface ModConfig {
  id: string;
  name: string;
  targetExtensionId: string;
  targetName: string;
  description: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
}

export interface ExtensionModManifest {
  id: string;
  name: string;
  version: string;
  mods: ModConfig[];
}
