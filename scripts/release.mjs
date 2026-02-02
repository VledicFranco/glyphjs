#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: "utf-8", stdio: "pipe", ...opts }).trim();
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// --- Validate arguments ---
const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump)) {
  console.log("Usage: node scripts/release.mjs <patch|minor|major>");
  process.exit(1);
}

// --- Validate environment ---
try {
  run("git rev-parse --is-inside-work-tree");
} catch {
  fail("Not inside a git repository.");
}

const branch = run("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") {
  fail(`Must be on the 'main' branch (currently on '${branch}').`);
}

const status = run("git status --porcelain");
if (status.length > 0) {
  fail("Working tree is not clean. Commit or stash your changes first.");
}

try {
  run("gh --version");
} catch {
  fail("GitHub CLI (gh) is not installed or not in PATH.");
}

// --- Read current version ---
const typesPackagePath = join(root, "packages", "types", "package.json");
const typesPackage = JSON.parse(readFileSync(typesPackagePath, "utf-8"));
const currentVersion = typesPackage.version;

if (!currentVersion) {
  fail("Could not read current version from packages/types/package.json.");
}

// --- Compute next version ---
const [major, minor, patch] = currentVersion.split(".").map(Number);
let nextVersion;
switch (bump) {
  case "major":
    nextVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    nextVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
    nextVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version: ${currentVersion} → ${nextVersion} (${bump})`);

// --- Update all package.json files ---
const packages = [
  "types",
  "schemas",
  "parser",
  "ir",
  "compiler",
  "runtime",
  "components",
  "brand",
];

for (const pkg of packages) {
  const pkgPath = join(root, "packages", pkg, "package.json");
  const pkgJson = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkgJson.version = nextVersion;
  writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
  console.log(`  Updated packages/${pkg}/package.json`);
}

// --- Update CHANGELOG.md ---
const changelogPath = join(root, "CHANGELOG.md");
const changelog = readFileSync(changelogPath, "utf-8");
const today = new Date().toISOString().split("T")[0];
const newSection = `## [Unreleased]\n\n## [${nextVersion}] - ${today}`;
const updatedChangelog = changelog.replace("## [Unreleased]", newSection);
writeFileSync(changelogPath, updatedChangelog);
console.log("  Updated CHANGELOG.md");

// --- Git commit and tag ---
const tag = `v${nextVersion}`;
run("git add -A");
run(`git commit -m "chore: release ${tag}"`);
console.log(`  Committed: chore: release ${tag}`);

run(`git tag ${tag}`);
console.log(`  Tagged: ${tag}`);

// --- Push ---
run("git push");
run("git push --tags");
console.log("  Pushed commit and tag");

// --- Create GitHub release ---
run(`gh release create ${tag} --title "${tag}" --generate-notes`);
console.log(`  Created GitHub release: ${tag}`);

console.log(`\nRelease ${tag} complete!`);
