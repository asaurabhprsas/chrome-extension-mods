(() => {
  const MOD_ID = "stayfree-custom-timer";
  const STORAGE_KEY_PRESETS = "stayfree_mod_presets";
  const STORAGE_KEY_ENABLED = "chrome_mods_enabled";

  const DEFAULT_PRESETS = [
    { id: "preset_15m", minutes: 15, label: "15m" },
    { id: "preset_30m", minutes: 30, label: "30m" },
    { id: "preset_2h", minutes: 120, label: "2h" }
  ];

  let currentPresets = [...DEFAULT_PRESETS];
  let isModEnabled = true;
  let activeCustomMinutes = null;
  let lastInjectedDialog = null;

  async function loadState() {
    try {
      const data = await chrome.storage.local.get([STORAGE_KEY_ENABLED, STORAGE_KEY_PRESETS]);
      if (data[STORAGE_KEY_ENABLED] && typeof data[STORAGE_KEY_ENABLED][MOD_ID] === "boolean") {
        isModEnabled = data[STORAGE_KEY_ENABLED][MOD_ID];
      }
      if (Array.isArray(data[STORAGE_KEY_PRESETS])) {
        currentPresets = data[STORAGE_KEY_PRESETS];
      } else {
        await chrome.storage.local.set({ [STORAGE_KEY_PRESETS]: DEFAULT_PRESETS });
      }
    } catch (e) {
      console.warn("[Chrome Mods] Error reading storage:", e);
    }
  }

  function formatDuration(mins) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }

  function injectCustomUI(dialogContainer) {
    if (!isModEnabled) return;
    if (dialogContainer.dataset.modInjected === "true") return;
    dialogContainer.dataset.modInjected = "true";

    const selectEl = dialogContainer.querySelector("select#type");
    const confirmBtn = dialogContainer.querySelector('[data-testid="confirm"]');
    const cancelBtn = dialogContainer.querySelector("button.btn-neutral");
    if (!selectEl || !confirmBtn) return;

    // Check if Custom option already added to select
    let customOption = selectEl.querySelector('option[value="mod-custom"]');
    if (!customOption) {
      customOption = document.createElement("option");
      customOption.value = "mod-custom";
      customOption.textContent = "Custom duration...";
      selectEl.appendChild(customOption);
    }

    // Create Mod UI Container
    const modWrapper = document.createElement("div");
    modWrapper.id = "stayfree-mod-container";
    modWrapper.style.cssText = `
      margin-top: 12px;
      margin-bottom: 8px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 13px;
    `;

    function renderModContent() {
      modWrapper.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:600; color:#ddd; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Quick Presets</span>
          <span style="color:#aaa; font-size:11px;">Select or custom</span>
        </div>
        <div id="mod-preset-list" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;"></div>
        
        <div id="mod-custom-panel" style="display:${activeCustomMinutes !== null || selectEl.value === 'mod-custom' ? 'block' : 'none'}; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <label style="display:flex; align-items:center; gap:4px; color:#ccc; font-size:12px;">
              <input id="mod-input-hrs" type="number" min="0" max="72" value="0" style="width:48px; background:#18191c; color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:4px; padding:4px 6px; text-align:center; font-size:13px;" /> hrs
            </label>
            <label style="display:flex; align-items:center; gap:4px; color:#ccc; font-size:12px;">
              <input id="mod-input-mins" type="number" min="1" max="59" value="15" style="width:52px; background:#18191c; color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:4px; padding:4px 6px; text-align:center; font-size:13px;" /> mins
            </label>
            <button id="mod-btn-save-preset" type="button" style="margin-left:auto; background:rgba(179,157,219,0.15); color:#d1c4e9; border:1px solid rgba(179,157,219,0.3); border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">
              + Save Preset
            </button>
          </div>
          <div id="mod-preview-text" style="font-size:12px; color:#b39ddb; margin-top:4px;">
            ${activeCustomMinutes ? `Deactivate for: <strong>${formatDuration(activeCustomMinutes)}</strong>` : ""}
          </div>
        </div>
      `;

      // Populate Presets
      const presetList = modWrapper.querySelector("#mod-preset-list");
      currentPresets.forEach((preset) => {
        const chip = document.createElement("div");
        const isActive = activeCustomMinutes === preset.minutes;
        chip.style.cssText = `
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 12px;
          background: ${isActive ? "#7e57c2" : "rgba(255,255,255,0.08)"};
          color: ${isActive ? "#ffffff" : "#cccccc"};
          border: 1px solid ${isActive ? "#9575cd" : "rgba(255,255,255,0.12)"};
          cursor: pointer;
          font-size: 12px;
          user-select: none;
        `;

        const labelSpan = document.createElement("span");
        labelSpan.textContent = preset.label;
        labelSpan.addEventListener("click", () => {
          activeCustomMinutes = preset.minutes;
          selectEl.value = "mod-custom";
          selectEl.dispatchEvent(new Event("change", { bubbles: true }));
          renderModContent();
        });

        const delBtn = document.createElement("span");
        delBtn.innerHTML = "&times;";
        delBtn.style.cssText = `
          font-size: 14px;
          line-height: 1;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          margin-left: 2px;
        `;
        delBtn.title = "Remove preset";
        delBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          currentPresets = currentPresets.filter((p) => p.id !== preset.id);
          await chrome.storage.local.set({ [STORAGE_KEY_PRESETS]: currentPresets });
          if (activeCustomMinutes === preset.minutes) activeCustomMinutes = null;
          renderModContent();
        });

        chip.appendChild(labelSpan);
        chip.appendChild(delBtn);
        presetList.appendChild(chip);
      });

      // "+ Custom" chip
      const customChip = document.createElement("div");
      customChip.style.cssText = `
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 12px;
        background: rgba(255,255,255,0.04);
        color: #aaa;
        border: 1px dashed rgba(255,255,255,0.2);
        cursor: pointer;
        font-size: 11px;
      `;
      customChip.textContent = "+ Custom";
      customChip.addEventListener("click", () => {
        selectEl.value = "mod-custom";
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        const customPanel = modWrapper.querySelector("#mod-custom-panel");
        if (customPanel) customPanel.style.display = "block";
      });
      presetList.appendChild(customChip);

      // Bind custom panel inputs
      const hrsInput = modWrapper.querySelector("#mod-input-hrs");
      const minsInput = modWrapper.querySelector("#mod-input-mins");
      const saveBtn = modWrapper.querySelector("#mod-btn-save-preset");
      const previewText = modWrapper.querySelector("#mod-preview-text");

      function updateFromInputs() {
        const h = parseInt(hrsInput?.value || "0", 10) || 0;
        const m = parseInt(minsInput?.value || "0", 10) || 0;
        const total = h * 60 + m;
        if (total > 0) {
          activeCustomMinutes = total;
          if (previewText) {
            previewText.innerHTML = `Deactivate for: <strong>${formatDuration(total)}</strong>`;
          }
        }
      }

      hrsInput?.addEventListener("input", updateFromInputs);
      minsInput?.addEventListener("input", updateFromInputs);

      saveBtn?.addEventListener("click", async () => {
        const h = parseInt(hrsInput?.value || "0", 10) || 0;
        const m = parseInt(minsInput?.value || "0", 10) || 0;
        const total = h * 60 + m;
        if (total <= 0) return;

        if (!currentPresets.some((p) => p.minutes === total)) {
          const newPreset = {
            id: `preset_${Date.now()}_${total}`,
            minutes: total,
            label: formatDuration(total)
          };
          currentPresets.push(newPreset);
          currentPresets.sort((a, b) => a.minutes - b.minutes);
          await chrome.storage.local.set({ [STORAGE_KEY_PRESETS]: currentPresets });
        }
        activeCustomMinutes = total;
        renderModContent();
      });
    }

    renderModContent();

    // Insert mod wrapper right after the select dropdown parent
    const selectParent = selectEl.closest(".flex") || selectEl.parentElement;
    if (selectParent && selectParent.parentElement) {
      selectParent.parentElement.insertBefore(modWrapper, selectParent.nextSibling);
    }

    // Listen to native select change
    selectEl.addEventListener("change", () => {
      const customPanel = modWrapper.querySelector("#mod-custom-panel");
      if (selectEl.value === "mod-custom") {
        if (customPanel) customPanel.style.display = "block";
        if (!activeCustomMinutes) {
          activeCustomMinutes = 15;
          renderModContent();
        }
      } else {
        activeCustomMinutes = null;
        if (customPanel) customPanel.style.display = "none";
        renderModContent();
      }
    });

    // Intercept Deactivate button click
    const originalClickHandler = async (evt) => {
      if (activeCustomMinutes && activeCustomMinutes > 0) {
        evt.preventDefault();
        evt.stopImmediatePropagation();

        const until = Date.now() + activeCustomMinutes * 60 * 1000;
        console.log(`[StayFree Mod] Deactivating StayFree for ${activeCustomMinutes} mins until ${new Date(until).toLocaleTimeString()}`);
        
        await chrome.storage.local.set({
          "stayfree-deactivated": { until: until }
        });

        // Trigger dismiss / cancel button to cleanly close dialog
        if (cancelBtn) {
          cancelBtn.click();
        }
      }
    };

    confirmBtn.addEventListener("click", originalClickHandler, true);
  }

  // MutationObserver to detect dialog opening
  const observer = new MutationObserver(() => {
    const dialogTitle = Array.from(document.querySelectorAll("div, h1, h2, h3, p")).find(
      (el) => el.textContent && el.textContent.trim() === "Deactivate StayFree"
    );
    if (dialogTitle) {
      const dialog = dialogTitle.closest(".modal") || dialogTitle.closest('[class*="w-96"]') || dialogTitle.parentElement?.parentElement;
      if (dialog && dialog !== lastInjectedDialog) {
        lastInjectedDialog = dialog;
        injectCustomUI(dialog);
      }
    }
  });

  loadState().then(() => {
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("[Chrome Mods] StayFree Custom Timer mod initialized.");
  });

  // Watch for toggle updates from Manager Extension
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY_ENABLED]) {
      const newVal = changes[STORAGE_KEY_ENABLED].newValue;
      if (newVal && typeof newVal[MOD_ID] === "boolean") {
        isModEnabled = newVal[MOD_ID];
        console.log("[Chrome Mods] StayFree mod enabled state:", isModEnabled);
      }
    }
    if (changes[STORAGE_KEY_PRESETS]) {
      currentPresets = changes[STORAGE_KEY_PRESETS].newValue || DEFAULT_PRESETS;
    }
  });
})();
