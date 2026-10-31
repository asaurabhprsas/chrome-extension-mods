# Chrome Extension Modding Learnings

## 1. Browser Security & Isolation
- Extension cannot inject content script into another extension (`chrome-extension://*`).
- Extension A storage isolated from Extension B storage.
- Cross-extension runtime messaging only works if target extension explicitly allows `externally_connectable`.

## 2. Web Store Hash Check
- Chromium checks Web Store extensions against `_metadata/verified_contents.json`.
- Modifying files directly in `Default/Extensions/<id>/<version>` ignored or marked corrupt by browser.
- **Fix**: Remove or rename `_metadata` to `_metadata.bak`, OR load folder as `Load unpacked` in Developer mode.

## 3. Vue 3 / Framework UI Modding
- Modifying DOM via `MutationObserver` on compiled Vue 3 apps fragile. Vue virtual DOM wipes or ignores external DOM mutations.
- **Fix**: Patch compiled chunk directly (`defineAppConfig-*.js`):
  - Add options directly to Vue `option` slot array.
  - Patch deactivation handler `o(c)` to accept custom minutes (`custom_XX`).
  - Read/write custom presets to `localStorage` dynamically.

## 4. Timer Expiry & Live Tab Re-Blocking
- Target extension only checked `until` timestamp on initial page load.
- When timer expired, open tabs never re-checked. User could keep browsing indefinitely.
- Storage never reset `stayfree-deactivated: false` automatically.
- **Fix (Two-layer enforcement)**:
  1. **Background**: Watch `stayfree-deactivated` storage change. Set `setTimeout` + `chrome.alarms`. When `Date.now() >= until`, reset storage to `false` and broadcast `{ type: "limits-changed" }` to all open tabs.
  2. **Content Script (`block-website.js`)**: If deactivation active, calculate `left = until - now` and set local `setTimeout(() => I(W), left + 500)`. Slams block overlay onto active tab immediately without reload.

## 5. Workflow & Symlink
- Keep clean un-tampered copy as `.backup`.
- Symlink browser extension directory to workspace repo directory for live editing.
- Automate patching via script (`scripts/patch-and-link.mjs`) so repeatable on any browser (Chrome, Brave, Edge, Helium).
