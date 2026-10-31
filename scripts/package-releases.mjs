import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const RELEASE_DIR = path.join(ROOT_DIR, "release");
const STAYFREE_DIR = path.join(ROOT_DIR, "extensions/stayfree");
const MANAGER_DIST = path.join(ROOT_DIR, "packages/manager/dist");
const MANAGER_PKG = path.join(ROOT_DIR, "packages/manager/package.json");

function getFormattedDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main() {
  const dateStr = getFormattedDate();
  console.log(`=== Packaging Pre-built Release Zips (Date: ${dateStr}) ===`);

  fs.mkdirSync(RELEASE_DIR, { recursive: true });

  // 1. Read base versions
  const stayfreeManifestPath = path.join(STAYFREE_DIR, "manifest.json");
  const stayfreeManifest = JSON.parse(fs.readFileSync(stayfreeManifestPath, "utf8"));
  const stayfreeBaseVersion = stayfreeManifest.version || "2.11.2";
  const stayfreeVersionName = `${stayfreeBaseVersion}-mod.${dateStr}`;

  // Update manifest version_name with date
  stayfreeManifest.version_name = stayfreeVersionName;
  fs.writeFileSync(stayfreeManifestPath, JSON.stringify(stayfreeManifest, null, 3), "utf8");
  console.log(`[StayFree] Set version_name to: ${stayfreeVersionName}`);

  // Manager version
  const managerPkg = JSON.parse(fs.readFileSync(MANAGER_PKG, "utf8"));
  const managerVersion = `${managerPkg.version || "1.0.0"}-${dateStr}`;

  // 2. Build manager extension
  console.log("[1/3] Building manager extension...");
  execSync("pnpm --filter @chrome-mods/manager build", { stdio: "inherit" });

  // 3. Package StayFree zip with actual version + date
  const stayfreeDatedZipName = `stayfree-v${stayfreeBaseVersion}-${dateStr}.zip`;
  const stayfreeDatedZip = path.join(RELEASE_DIR, stayfreeDatedZipName);
  const stayfreeLatestZip = path.join(RELEASE_DIR, "stayfree-modded-latest.zip");

  if (fs.existsSync(stayfreeDatedZip)) fs.unlinkSync(stayfreeDatedZip);
  if (fs.existsSync(stayfreeLatestZip)) fs.unlinkSync(stayfreeLatestZip);

  console.log(`[2/3] Creating release/${stayfreeDatedZipName}...`);
  execSync(`cd "${STAYFREE_DIR}" && zip -r "${stayfreeDatedZip}" . -x "*.bak" -x "*.orig"`, {
    stdio: "inherit"
  });
  fs.copyFileSync(stayfreeDatedZip, stayfreeLatestZip);

  // 4. Package Manager zip with version + date
  const managerDatedZipName = `chrome-mods-manager-v${managerVersion}.zip`;
  const managerDatedZip = path.join(RELEASE_DIR, managerDatedZipName);
  const managerLatestZip = path.join(RELEASE_DIR, "chrome-mods-manager-latest.zip");

  if (fs.existsSync(managerDatedZip)) fs.unlinkSync(managerDatedZip);
  if (fs.existsSync(managerLatestZip)) fs.unlinkSync(managerLatestZip);

  console.log(`[3/3] Creating release/${managerDatedZipName}...`);
  execSync(`cd "${MANAGER_DIST}" && zip -r "${managerDatedZip}" .`, {
    stdio: "inherit"
  });
  fs.copyFileSync(managerDatedZip, managerLatestZip);

  console.log("\n[SUCCESS] Release zips created in ./release/:");
  console.log(` - ${stayfreeDatedZipName} (${(fs.statSync(stayfreeDatedZip).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(` - ${stayfreeLatestZip} (alias)`);
  console.log(` - ${managerDatedZipName} (${(fs.statSync(managerDatedZip).size / 1024).toFixed(2)} KB)`);
  console.log(` - ${managerLatestZip} (alias)`);
}

main().catch((err) => {
  console.error("[Fatal Error]", err);
  process.exit(1);
});
