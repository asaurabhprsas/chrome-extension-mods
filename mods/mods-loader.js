// Universal Chrome Mods Loader
(() => {
  console.log("[Chrome Mods] Loader initialized in extension context:", chrome.runtime.id);
  
  // Extension ID to Mod Script mapping
  const MOD_REGISTRY = {
    "elfaihghhjjoknimpccccmkioofjjfkf": "/mods/stayfree/stayfree-mod.js"
  };

  const modScriptPath = MOD_REGISTRY[chrome.runtime.id];
  if (modScriptPath) {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL(modScriptPath);
    s.onload = () => s.remove();
    (document.head || document.documentElement).appendChild(s);
  }
})();
