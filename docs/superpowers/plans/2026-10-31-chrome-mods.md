# Chrome Extension Mod System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a modular Chrome extension modding system in this repo, including a standalone Manager extension to toggle mods, a StayFree mod for custom deactivation timers and presets, and automated symlinking to Helium.

---

### Task 1: Repository & Toolchain Scaffolding
- [ ] Initialize PNPM workspace (`pnpm-workspace.yaml`, `package.json`, `.gitignore`).
- [ ] Configure TypeScript, Vitest for testing, and build scripts.
- [ ] Verify root `pnpm install` and `pnpm test` run cleanly.

### Task 2: Core Mod Contract & Presets Logic (TDD)
- [ ] Write unit tests for custom timer calculations and preset management (add, validate, remove presets).
- [ ] Implement `packages/core` with shared types (`ModDefinition`, `PresetItem`) and storage helpers.
- [ ] Verify core tests pass.

### Task 3: StayFree Mod Implementation (`mods/stayfree`)
- [ ] Implement `mods/stayfree/custom-timer.js` providing:
  - Custom duration picker (hours & minutes).
  - Quick-preset chips with save and delete capability.
  - Expiration timestamp generator `{ until: Date.now() + ms }`.
- [ ] Implement `mods/stayfree/hook.js` for injection into StayFree's Vue 3 deactivation dialog.
- [ ] Add unit test verifying custom duration conversion to StayFree state structure.

### Task 4: Standalone Manager Extension (`packages/manager`)
- [ ] Setup React + Vite + Tailwind + Lucide in `packages/manager`.
- [ ] Build Popup UI:
  - List detected/supported extensions (StayFree, etc.).
  - Toggle switch to enable/disable mods.
  - Status indicators and mod settings view.
- [ ] Configure `manifest.json` (MV3) with necessary storage permissions.
- [ ] Verify build passes (`pnpm build`).

### Task 5: Patcher & Helium Symlinker
- [ ] Implement `scripts/patch-and-link.mjs`:
  - Backup target extension directory in Helium.
  - Copy StayFree files to `extensions/stayfree`.
  - Inject hook bridge into `extensions/stayfree/popup.html`.
  - Create symlink from Helium's extension folder to `extensions/stayfree`.
- [ ] Test linking and unlinking operations.

### Task 6: Verification & Integration
- [ ] Run test suite (`pnpm test`).
- [ ] Run lint/typecheck.
- [ ] Verify loaded popup in Helium browser environment.
