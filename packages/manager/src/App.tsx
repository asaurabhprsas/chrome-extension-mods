import React, { useState, useEffect } from "react";
import {
  Sliders,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Power
} from "lucide-react";
import type { TimerPreset } from "@chrome-mods/core";

const STORAGE_KEY_ENABLED = "chrome_mods_enabled";
const STORAGE_KEY_PRESETS = "stayfree_mod_presets";

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: "preset_15m", minutes: 15, label: "15m" },
  { id: "preset_30m", minutes: 30, label: "30m" },
  { id: "preset_2h", minutes: 120, label: "2h" }
];

export function App() {
  const [stayFreeEnabled, setStayFreeEnabled] = useState(true);
  const [presets, setPresets] = useState<TimerPreset[]>(DEFAULT_PRESETS);
  const [newMinutes, setNewMinutes] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [activeTab, setActiveTab] = useState<"mods" | "presets">("mods");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY_ENABLED, STORAGE_KEY_PRESETS], (result) => {
        if (result[STORAGE_KEY_ENABLED]) {
          setStayFreeEnabled(result[STORAGE_KEY_ENABLED]["stayfree-custom-timer"] !== false);
        }
        if (Array.isArray(result[STORAGE_KEY_PRESETS])) {
          setPresets(result[STORAGE_KEY_PRESETS]);
        }
      });
    }
  }, []);

  const toggleStayFree = (enabled: boolean) => {
    setStayFreeEnabled(enabled);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY_ENABLED], (res) => {
        const current = res[STORAGE_KEY_ENABLED] || {};
        chrome.storage.local.set({
          [STORAGE_KEY_ENABLED]: {
            ...current,
            "stayfree-custom-timer": enabled
          }
        });
      });
    }
  };

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(newMinutes, 10);
    if (!mins || mins <= 0) return;

    const label = newLabel.trim() || `${mins}m`;
    const updated = [
      ...presets.filter((p) => p.minutes !== mins),
      { id: `preset_${Date.now()}_${mins}`, minutes: mins, label }
    ].sort((a, b) => a.minutes - b.minutes);

    setPresets(updated);
    setNewMinutes("");
    setNewLabel("");

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY_PRESETS]: updated });
    }
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY_PRESETS]: updated });
    }
  };

  return (
    <div className="w-[380px] bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sliders size={16} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-100">Chrome Mods</h1>
            <p className="text-[10px] text-slate-400">Extension Tweaks & Enhancements</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <CheckCircle2 size={12} />
          <span>Helium Linked</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-4 text-xs">
        <button
          onClick={() => setActiveTab("mods")}
          className={`pb-2 font-medium border-b-2 transition-colors ${
            activeTab === "mods"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Active Mods ({stayFreeEnabled ? 1 : 0}/1)
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={`pb-2 font-medium border-b-2 transition-colors ${
            activeTab === "presets"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          StayFree Presets ({presets.length})
        </button>
      </div>

      {/* Main Content */}
      <main className="p-4 flex-1 overflow-y-auto space-y-3">
        {activeTab === "mods" ? (
          <>
            {/* StayFree Mod Card */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-3 hover:border-slate-600/80 transition-all">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">StayFree</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
                      v2.11.2
                    </span>
                  </div>
                  <h3 className="text-xs text-indigo-300 font-medium">Custom Deactivation Timer</h3>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stayFreeEnabled}
                    onChange={(e) => toggleStayFree(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adds custom minutes/hours input and reusable quick-select presets to StayFree's deactivation modal.
              </p>

              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-indigo-400" />
                  {presets.length} Presets Available
                </span>
                <button
                  onClick={() => setActiveTab("presets")}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
                >
                  Configure &rarr;
                </button>
              </div>
            </div>

            {/* Ready for more extensions card */}
            <div className="bg-slate-800/20 border border-dashed border-slate-700/60 rounded-xl p-3 text-center space-y-1.5">
              <ShieldCheck size={18} className="mx-auto text-slate-500" />
              <p className="text-xs text-slate-300 font-medium">Add More Mods Anytime</p>
              <p className="text-[10px] text-slate-500">
                Drop new tweak files into <code className="text-slate-400">mods/&lt;ext-name&gt;</code> and they will appear here automatically.
              </p>
            </div>
          </>
        ) : (
          /* Presets Tab */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Saved Presets
              </span>
              <div className="space-y-1.5">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-800/70 border border-slate-700/50 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span className="font-medium text-slate-200">{preset.label}</span>
                      <span className="text-[11px] text-slate-400">({preset.minutes} min)</span>
                    </div>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remove preset"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Preset Form */}
            <form onSubmit={handleAddPreset} className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Add New Preset
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  placeholder="Mins"
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(e.target.value)}
                  className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Label (e.g. 45m Focus)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} />
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-2.5 bg-slate-800/40 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Chrome Mods v1.0.0</span>
        <span>Local Helium Workspace</span>
      </footer>
    </div>
  );
}
