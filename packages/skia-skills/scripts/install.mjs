#!/usr/bin/env node
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_SOURCE = join(__dirname, "..", "skills");
const SKILL_FILE = "react-native-skia.md";

// Determine target directory
const args = process.argv.slice(2);
let targetDir;

if (args.includes("--global")) {
  // Install to ~/.claude/skills
  targetDir = join(homedir(), ".claude", "skills");
} else {
  // Install to current project's .claude/skills
  targetDir = join(process.cwd(), ".claude", "skills");
}

console.log(`Installing React Native Skia skill to ${targetDir}`);

mkdirSync(targetDir, { recursive: true });

const source = join(SKILLS_SOURCE, SKILL_FILE);
const dest = join(targetDir, SKILL_FILE);

if (!existsSync(source)) {
  console.error(`Error: Skill file not found at ${source}`);
  console.error("Please run 'npm run build' in the skia-skills package first.");
  process.exit(1);
}

copyFileSync(source, dest);
console.log(`✓ Installed ${SKILL_FILE}`);
console.log(`\nUsage: Invoke with /react-native-skia in Claude Code`);
