# Chrome Extension Mods (`chrome-mods`)

A modular toolkit to patch and inject missing features into Chrome extensions without having to manually rewrite their builds on every update.

Currently includes an enhanced build of **StayFree (Website Blocker)** that adds custom deactivation timers, reusable presets, and instant re-blocking when the timer expires.

---

## Features

### StayFree Mod
StayFree only ships with fixed deactivation options (5 minutes, 1 hour, end of day, until turned on). This mod adds:
- **Custom Durations**: Enter any minute value on the fly (e.g. 25m for a Pomodoro break, 45m, 90m).
- **Reusable Presets**: Built-in 15m, 30m, 2h, and 4h presets, plus the ability to save custom durations directly to the dropdown.
- **Preset Management**: Remove saved presets whenever you want directly from the dialog.
- **Real-time Re-blocking**: Standard StayFree only checks deactivation on page load. This mod adds a timer directly inside open tabs and a background expiration listener. As soon as your countdown hits zero, active tabs block instantly without requiring a page refresh.

### Mods Manager Extension (`packages/manager`)
A standalone Manifest V3 companion extension (built with React, TypeScript, and Tailwind) to inspect, configure, and toggle mods per extension.

### Universal Patcher (`scripts/patch-and-link.mjs`)
A Node CLI tool that:
- Automatically detects installed extensions in Helium, Google Chrome, Brave, Chromium, or Microsoft Edge.
- Makes a backup of the original extension directory.
- Disables Web Store hash verification (`_metadata`).
- Applies UI and background patches cleanly.
- Symlinks the modded extension into your browser's profile for live development.

---

## Quick Start: Install in Any Browser

You can install this mod in any Chromium browser (Chrome, Helium, Brave, Edge, Opera, Vivaldi).

### Option 1: Direct Download (No coding or building required)
1. Go to the **[Releases](../../releases)** tab on GitHub.
2. Download the latest dated zip:
   - `stayfree-v2.11.2-YYYY-MM-DD.zip` (or `stayfree-modded-latest.zip`)
   - *(Optional)* `chrome-mods-manager-v1.0.0-YYYY-MM-DD.zip`
3. Extract the downloaded zip file into a folder on your computer.
4. In your browser, open the extensions manager:
   - **Chrome / Helium**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
5. Turn **ON** `Developer mode` (top-right toggle).
6. Click **Load unpacked** and select the extracted folder.

---

### Option 2: Clone & Local Development
Navigate to your browser's extension settings:
- **Helium / Chrome**: `chrome://extensions`
- **Brave**: `brave://extensions`
- **Edge**: `edge://extensions`

### Step 2: Enable Developer Mode
Turn on the **Developer mode** toggle in the top-right corner.

### Step 3: Load Unpacked
1. Click **Load unpacked**.
2. Select the [`extensions/stayfree`](./extensions/stayfree) directory from this repo.
3. *(Optional)* To run the Manager dashboard, click **Load unpacked** again and select [`packages/manager/dist`](./packages/manager/dist).

Open StayFree, click the power toggle to deactivate, and you will see the new custom presets and timer options.

---

## Project Structure

```text
extension-chrome-mods/
├── extensions/
│   └── stayfree/           # Ready-to-load patched StayFree extension
├── mods/
│   ├── mods-loader.js      # Universal injection loader
│   └── stayfree/           # StayFree mod configuration and standalone scripts
├── packages/
│   ├── core/               # Shared logic, preset math, and storage types
│   └── manager/            # Standalone React + Vite management dashboard
├── scripts/
│   └── patch-and-link.mjs  # Universal backup, patch, and symlink CLI
├── .agents/
│   └── learnings/          # Technical gotchas, CSP notes, and architecture docs
├── package.json
└── pnpm-workspace.yaml
```

---

## Development & Automation

### Prerequisites
- Node.js 18+
- PNPM (`corepack enable` or `npm i -g pnpm`)

### Install Dependencies
```bash
pnpm install
```

### Run Tests
Runs the Vitest suite covering preset calculations, timestamp boundaries, and mod logic:
```bash
pnpm test
```

### Build Packages
Compiles the `@chrome-mods/core` library and builds the Manager extension:
```bash
pnpm build
```

### Re-run Patcher on Local Browser
If you have StayFree installed from the Chrome Web Store in your default browser profile, run:
```bash
pnpm patch:stayfree
```
This automatically backs up the store installation, applies our patches, and symlinks it to this workspace.

---

## Technical Learnings & Architecture

If you are writing mods for other extensions, see [`.agents/learnings/chrome-extension-modding.md`](./.agents/learnings/chrome-extension-modding.md) for notes on:
- Bypassing Chromium Web Store `_metadata/verified_contents.json` hash checks.
- Working around Manifest V3 Content Security Policy restrictions on dynamic script tags.
- Hooking into compiled Vue 3 / framework component slots rather than relying on brittle DOM mutation observers.
- Coordinating background alarms with content script timeouts for reliable instant tab blocking.

---

## Disclaimer

This project is an independent community modification tool for personal productivity. It is not affiliated with, endorsed by, or sponsored by StayFree Apps or any third-party extension developers. All trademarks and brand names belong to their respective owners.
