import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = os.homedir();
const EXTENSION_ID = "elfaihghhjjoknimpccccmkioofjjfkf";

// Supported browser extension directories
const BROWSER_PATHS = {
  helium: path.join(HOME, ".config/net.imput.helium/Default/Extensions", EXTENSION_ID),
  chrome: path.join(HOME, ".config/google-chrome/Default/Extensions", EXTENSION_ID),
  chromium: path.join(HOME, ".config/chromium/Default/Extensions", EXTENSION_ID),
  brave: path.join(HOME, ".config/BraveSoftware/Brave-Browser/Default/Extensions", EXTENSION_ID),
  edge: path.join(HOME, ".config/microsoft-edge/Default/Extensions", EXTENSION_ID)
};

const WORKSPACE_DIR = process.cwd();
const STAYFREE_REPO_DIR = path.join(WORKSPACE_DIR, "extensions/stayfree");

function findInstalledBrowser() {
  for (const [browser, basePath] of Object.entries(BROWSER_PATHS)) {
    if (fs.existsSync(basePath)) {
      const versions = fs.readdirSync(basePath).filter((v) => !v.endsWith(".backup") && !v.endsWith(".bak"));
      if (versions.length > 0) {
        return { browser, basePath, version: versions[0], fullPath: path.join(basePath, versions[0]) };
      }
    }
  }
  return null;
}

export function patchStayFreeCode(targetDir) {
  console.log(`[Patching] Applying custom timer & instant-blocking hooks to: ${targetDir}`);

  // 1. Disable _metadata to bypass Chrome Web Store hash verification
  const metaDir = path.join(targetDir, "_metadata");
  if (fs.existsSync(metaDir)) {
    fs.renameSync(metaDir, `${metaDir}.bak`);
    console.log("  - Disabled _metadata hash check");
  }

  // 2. Patch chunks/defineAppConfig-*.js (Custom Timer Dropdown, Presets & Expiration calculation)
  const chunksDir = path.join(targetDir, "chunks");
  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir).filter((f) => f.startsWith("defineAppConfig-") && f.endsWith(".js"));
    for (const chunk of chunkFiles) {
      const chunkPath = path.join(chunksDir, chunk);
      let content = fs.readFileSync(chunkPath, "utf8");

      // Patch o(c) deactivation calculation
      if (!content.includes('c==="fifteen-minutes"')) {
        content = content.replace(
          'async function o(c){if(c===wr.FiveMinutes)e.value={until:Date.now()+5*hs};else if(c===wr.OneHour)e.value={until:Date.now()+Ms};else if(c===wr.EndOfDay){const d=await i.getDailyResetTime();e.value={until:OW(d)}}else e.value=!0;s("STAYFREE_DEACTIVATED",{type:c})}',
          'async function o(c){if(c===wr.FiveMinutes)e.value={until:Date.now()+5*hs};else if(c==="fifteen-minutes")e.value={until:Date.now()+15*hs};else if(c==="thirty-minutes")e.value={until:Date.now()+30*hs};else if(c===wr.OneHour)e.value={until:Date.now()+Ms};else if(c==="two-hours")e.value={until:Date.now()+2*Ms};else if(c==="four-hours")e.value={until:Date.now()+4*Ms};else if(typeof c==="string"&&c.startsWith("custom_")){const m=parseInt(c.replace("custom_",""),10)||15;e.value={until:Date.now()+m*hs}}else if(c===wr.EndOfDay){const d=await i.getDailyResetTime();e.value={until:OW(d)}}else e.value=!0;s("STAYFREE_DEACTIVATED",{type:c})}'
        );
      }

      // Patch dialog options
      if (!content.includes('value:"fifteen-minutes"')) {
        content = content.replace(
          '[Ie("option",{value:ie(wr).FiveMinutes},os(ie(e)("deactivation.dialogOption0")),9,V7),Ie("option",{value:ie(wr).OneHour},os(ie(e)("deactivation.dialogOption1")),9,H7),Ie("option",{value:ie(wr).EndOfDay},os(ie(e)("deactivation.dialogOption2")),9,$7),Ie("option",{value:ie(wr).UntilTurnItBackOn},os(ie(e)("deactivation.dialogOption3")),9,K7)]',
          '[Ie("option",{value:ie(wr).FiveMinutes},os(ie(e)("deactivation.dialogOption0")),9,V7),Ie("option",{value:"fifteen-minutes"},"For 15 minutes"),Ie("option",{value:"thirty-minutes"},"For 30 minutes"),Ie("option",{value:ie(wr).OneHour},os(ie(e)("deactivation.dialogOption1")),9,H7),Ie("option",{value:"two-hours"},"For 2 hours"),Ie("option",{value:"four-hours"},"For 4 hours"),...(()=>{try{const q=localStorage.getItem("stayfree_mod_presets");if(q){const l=JSON.parse(q);return l.map(m=>Ie("option",{value:"custom_"+m,key:"custom_"+m},`For ${m} minutes (Preset)`))}}catch(e){}return[]})(),Ie("option",{value:"custom"},"Custom duration (enter minutes)..."),Ie("option",{value:"remove_preset"},"Manage: Remove a preset..."),Ie("option",{value:ie(wr).EndOfDay},os(ie(e)("deactivation.dialogOption2")),9,$7),Ie("option",{value:ie(wr).UntilTurnItBackOn},os(ie(e)("deactivation.dialogOption3")),9,K7)]'
        );
      }

      // Patch confirm action r()
      if (!content.includes('v==="remove_preset"')) {
        content = content.replace(
          'function r(){s.options?.onDeactivate?.(n.value),s.hide()}',
          'function r(){let v=n.value;if(v==="remove_preset"){try{const q=localStorage.getItem("stayfree_mod_presets")||"[]";const l=JSON.parse(q);if(l.length===0){window.alert("No custom presets saved yet.");return;}const a=window.prompt("Enter duration of preset to remove ("+l.join(", ")+" or all):",String(l[0]));if(!a)return;if(a.trim().toLowerCase()==="all"){localStorage.removeItem("stayfree_mod_presets");}else{const rm=parseInt(a,10);const next=l.filter(x=>x!==rm);localStorage.setItem("stayfree_mod_presets",JSON.stringify(next));}}catch(e){}s.hide();return;}if(v==="custom"){const a=window.prompt("Enter custom duration in minutes:","25");if(!a)return;const m=parseInt(a,10);if(isNaN(m)||m<=0)return;v="custom_"+m;try{const q=localStorage.getItem("stayfree_mod_presets")||"[]";const l=JSON.parse(q);if(!l.includes(m)){l.push(m);l.sort((x,y)=>x-y);localStorage.setItem("stayfree_mod_presets",JSON.stringify(l))}}catch(e){}}s.options?.onDeactivate?.(v),s.hide()}'
        );
      }

      fs.writeFileSync(chunkPath, content, "utf8");
      console.log(`  - Patched ${chunk}`);
    }
  }

  // 3. Patch content-scripts/block-website.js (Tab-level auto-timer for instant re-block)
  const blockScriptPath = path.join(targetDir, "content-scripts/block-website.js");
  if (fs.existsSync(blockScriptPath)) {
    let blockContent = fs.readFileSync(blockScriptPath, "utf8");
    if (!blockContent.includes("const _deact=await i.getStayFreeDeactivated()")) {
      blockContent = blockContent.replace(
        "async function I(W){if(rT(Date.now(),await i.getStayFreeDeactivated()))return;",
        'async function I(W){const _deact=await i.getStayFreeDeactivated();if(rT(Date.now(),_deact)){if(typeof _deact==="object"&&_deact&&"until"in _deact){const _rem=_deact.until-Date.now();if(_rem>0&&_rem<2147483647){setTimeout(()=>I(W),_rem+500);}}return;}if(typeof _deact==="object"&&_deact&&"until"in _deact&&Date.now()>=_deact.until){try{await i.setStayFreeDeactivated(!1)}catch(e){}}'
      );
      fs.writeFileSync(blockScriptPath, blockContent, "utf8");
      console.log("  - Patched content-scripts/block-website.js with auto-expiry listener");
    }
  }

  // 4. Patch background.js (Background auto-expiry alarm & tab broadcast)
  const bgPath = path.join(targetDir, "background.js");
  if (fs.existsSync(bgPath)) {
    let bgContent = fs.readFileSync(bgPath, "utf8");
    if (!bgContent.includes("_chkExp")) {
      bgContent = bgContent.replace(
        "var YK=uf;return YK})();",
        'var YK=uf;(()=>{let _tId=null;async function _chkExp(){try{const d=await chrome.storage.local.get("stayfree-deactivated");const v=d["stayfree-deactivated"];if(v&&typeof v==="object"&&v.until){const left=v.until-Date.now();if(left<=0){await chrome.storage.local.set({"stayfree-deactivated":!1});const tabs=await chrome.tabs.query({});for(const tb of tabs){if(tb.id){chrome.tabs.sendMessage(tb.id,{type:"limits-changed"}).catch(()=>{});}}}else{if(_tId)clearTimeout(_tId);_tId=setTimeout(_chkExp,Math.min(left+300,2147483647));chrome.alarms.create("sf_mod_expire",{when:v.until+300});}}}catch(e){}}chrome.storage.onChanged.addListener(c=>{if(c["stayfree-deactivated"])_chkExp();});chrome.alarms.onAlarm.addListener(a=>{if(a.name==="sf_mod_expire")_chkExp();});_chkExp();})();return YK})();'
      );
      fs.writeFileSync(bgPath, bgContent, "utf8");
      console.log("  - Patched background.js with auto-expiration broadcaster");
    }
  }
}

async function main() {
  console.log("====================================================");
  console.log("  Chrome Mods: StayFree Universal Browser Patcher   ");
  console.log("====================================================");

  const detected = findInstalledBrowser();

  if (!fs.existsSync(STAYFREE_REPO_DIR)) {
    if (!detected) {
      console.error("[!] StayFree extension not found in any standard browser path.");
      console.error("    Please install StayFree in Chrome, Helium, Brave, or Edge first.");
      process.exit(1);
    }
    console.log(`[Found] Detected installed StayFree in ${detected.browser}: ${detected.fullPath}`);
    fs.mkdirSync(STAYFREE_REPO_DIR, { recursive: true });
    fs.cpSync(detected.fullPath, STAYFREE_REPO_DIR, { recursive: true });
  }

  // Apply patches to the repo copy
  patchStayFreeCode(STAYFREE_REPO_DIR);

  // If detected browser, link it
  if (detected) {
    const isSymlink = fs.existsSync(detected.fullPath) && fs.lstatSync(detected.fullPath).isSymbolicLink();
    const backupDir = `${detected.fullPath}.backup`;

    if (!fs.existsSync(backupDir) && !isSymlink) {
      fs.cpSync(detected.fullPath, backupDir, { recursive: true });
      console.log(`[Backup] Original saved to: ${backupDir}`);
    }

    if (isSymlink) {
      fs.unlinkSync(detected.fullPath);
    } else {
      fs.rmSync(detected.fullPath, { recursive: true, force: true });
    }

    fs.symlinkSync(STAYFREE_REPO_DIR, detected.fullPath, "junction");
    console.log(`[Linked] ${detected.browser} extension symlinked -> ${STAYFREE_REPO_DIR}`);
  }

  console.log("\n[SUCCESS] Extension patched and ready!");
  console.log("To install in ANY Chromium browser (Chrome, Brave, Edge, Helium, Opera):");
  console.log("  1. Open browser -> navigate to chrome://extensions");
  console.log("  2. Toggle ON 'Developer mode' (top right)");
  console.log("  3. Click 'Load unpacked'");
  console.log(`  4. Select folder: ${STAYFREE_REPO_DIR}`);
}

main().catch((err) => {
  console.error("[Error]", err);
  process.exit(1);
});
