#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DOCS_PATH = join(ROOT, "..", "..", "apps", "docs", "docs");
const OUTPUT_PATH = join(ROOT, "skills", "react-native-skia.md");

const SKILL_HEADER = `# React Native Skia Skill

You are an expert in React Native Skia, a high-performance 2D graphics library for React Native.

## Behavior Guidelines

1. **Performance focus**: Always consider render performance implications
2. **Platform awareness**: Ask about target platform (iOS/Android/Web) when relevant
3. **Prefer declarative**: Suggest the declarative JSX API over imperative drawing when possible
4. **Shader expertise**: Provide guidance on SkSL shader syntax and best practices
5. **Reanimated integration**: Consider animation requirements and Reanimated 3 patterns

## Documentation Reference

The following sections contain the complete API documentation.

`;

function collectMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectMarkdownFiles(fullPath, files);
    } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }
  return files;
}

function buildSkill() {
  console.log("Building React Native Skia skill...");

  const files = collectMarkdownFiles(DOCS_PATH);
  console.log(`Found ${files.length} documentation files`);

  let content = SKILL_HEADER;

  // Group files by directory
  const grouped = {};
  for (const file of files) {
    const relPath = relative(DOCS_PATH, file);
    const dir = dirname(relPath);
    if (!grouped[dir]) {
      grouped[dir] = [];
    }
    grouped[dir].push({ path: file, relPath });
  }

  // Build content by section
  for (const [section, sectionFiles] of Object.entries(grouped).sort()) {
    const sectionTitle = section === "." ? "Overview" : section.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    content += `\n---\n\n## ${sectionTitle}\n\n`;

    for (const { path, relPath } of sectionFiles.sort((a, b) => a.relPath.localeCompare(b.relPath))) {
      const fileContent = readFileSync(path, "utf-8");
      // Remove frontmatter if present
      const withoutFrontmatter = fileContent.replace(/^---[\s\S]*?---\n*/, "");
      content += withoutFrontmatter + "\n\n";
    }
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, content);
  console.log(`Skill written to ${OUTPUT_PATH}`);
}

buildSkill();
