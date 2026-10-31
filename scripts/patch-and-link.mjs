import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HELIUM_EXT_BASE = path.join(
  os.homedir(),
  ".config/net.imput.helium/Default/Extensions/elfaihghhjjoknimpccccmkioofjjfkf"
);

const STAYFREE_VERSION = "2.11.2_0";
const HELIUM_TARGET_DIR = path.join(HELIUM_EXT_BASE, STAYFREE_VERSION);
const BACKUP_DIR = path.join(HELIUM_EXT_BASE, `${STAYFREE_VERSION}.backup`);

const WORKSPACE_DIR = process.cwd();
const REPO_EXTENSIONS_DIR = path.join(WORKSPACE_DIR, "extensions");
const STAYFREE_REPO_DIR = path.join(REPO_EXTENSIONS_DIR, "stayfree");
const MODS_SOURCE_DIR = path.join(WORKSPACE_DIR, "mods");

async function run() {
  console.log("=== Chrome Mods: StayFree Helium Patcher & Symlinker ===");

  if (!fs.existsSync(HELIUM_EXT_BASE)) {
    console.error(`[Error] Helium StayFree extension folder not found at: ${HELIUM_EXT_BASE}`);
    process.exit(1);
  }

  // 1. Ensure target repo directory exists
  fs.mkdirSync(REPO_EXTENSIONS_DIR, { recursive: true });

  // 2. Check if already symlinked
  const isSymlink = fs.existsSync(HELIUM_TARGET_DIR) && fs.lstatSync(HELIUM_TARGET_DIR).isSymbolicLink();

  if (!fs.existsSync(STAYFREE_REPO_DIR)) {
    console.log(`[1/5] Copying StayFree files from Helium to ${STAYFREE_REPO_DIR}...`);
    if (isSymlink) {
      console.log("Target is already a symlink. Skipping initial copy.");
    } else {
      fs.cpSync(HELIUM_TARGET_DIR, STAYFREE_REPO_DIR, { recursive: true });
    }
  } else {
    console.log(`[1/5] StayFree repo directory already present.`);
  }

  // 3. Backup original Helium folder if not already backed up
  if (!fs.existsSync(BACKUP_DIR)) {
    if (!isSymlink) {
      console.log(`[2/5] Creating safe backup at: ${BACKUP_DIR}...`);
      fs.cpSync(HELIUM_TARGET_DIR, BACKUP_DIR, { recursive: true });
    } else {
      console.log(`[2/5] Helium target is already symlinked; backup skipped.`);
    }
  } else {
    console.log(`[2/5] Backup already exists at: ${BACKUP_DIR}`);
  }

  // 4. Disable Web Store hash verification in repo directory
  const metadataDir = path.join(STAYFREE_REPO_DIR, "_metadata");
  if (fs.existsSync(metadataDir)) {
    console.log(`[3/5] Disabling _metadata hash verification...`);
    fs.renameSync(metadataDir, `${metadataDir}.bak`);
  }

  // Inject script into popup.html
  const popupHtmlPath = path.join(STAYFREE_REPO_DIR, "popup.html");
  if (fs.existsSync(popupHtmlPath)) {
    let popupHtml = fs.readFileSync(popupHtmlPath, "utf8");
    if (!popupHtml.includes("mods-loader.js")) {
      console.log(`[4/5] Injecting mods-loader script tag into popup.html...`);
      popupHtml = popupHtml.replace(
        "</body>",
        '    <script src="/mods-loader.js"></script>\n  </body>'
      );
      fs.writeFileSync(popupHtmlPath, popupHtml, "utf8");
    } else {
      console.log(`[4/5] popup.html already has mods-loader script tag.`);
    }
  }

  // 5. Establish symlink
  console.log(`[5/5] Establishing symlink from Helium to repo workspace...`);
  if (isSymlink) {
    const existingTarget = fs.readlinkSync(HELIUM_TARGET_DIR);
    if (existingTarget === STAYFREE_REPO_DIR) {
      console.log(`[OK] Symlink already correctly points to: ${STAYFREE_REPO_DIR}`);
      return;
    }
    fs.unlinkSync(HELIUM_TARGET_DIR);
  } else {
    // Remove original directory to make room for symlink
    fs.rmSync(HELIUM_TARGET_DIR, { recursive: true, force: true });
  }

  fs.symlinkSync(STAYFREE_REPO_DIR, HELIUM_TARGET_DIR, "junction");
  console.log(`[SUCCESS] Helium StayFree extension is now symlinked!`);
  console.log(`Target: ${HELIUM_TARGET_DIR} -> ${STAYFREE_REPO_DIR}`);
}

run().catch((err) => {
  console.error("[Fatal Error]", err);
  process.exit(1);
});
