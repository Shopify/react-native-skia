import * as fs from "fs";
import * as path from "path";

import { Project, DiagnosticCategory } from "ts-morph";

// Regex to extract code blocks with ```tsx twoslash
const twoslashRegex = /```tsx twoslash\n([\s\S]*?)```/g;

// Interface for snippet validation result
interface SnippetValidationResult {
  isValid: boolean;
  errors: string[];
}

// Function to validate a TypeScript snippet
function validateTypeScriptSnippet(snippet: string): SnippetValidationResult {
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, "..", "tsconfig.json"),
    compilerOptions: {
      noEmit: true,
    },
  });

  // Create a temporary source file
  const sourceFile = project.createSourceFile("temp.tsx", snippet);

  // Get all diagnostics (errors and warnings)
  const diagnostics = sourceFile.getPreEmitDiagnostics();

  // Filter for errors only (not warnings)
  const errors = diagnostics
    .filter(
      (diagnostic) => diagnostic.getCategory() === DiagnosticCategory.Error
    )
    .map((diagnostic) => {
      const message = diagnostic.getMessageText();
      const messageText =
        typeof message === "string" ? message : message.getMessageText();
      const lineAndChar = sourceFile.getLineAndColumnAtPos(
        diagnostic.getStart() || 0
      );
      return `Line ${lineAndChar.line}, Column ${lineAndChar.column}: ${messageText}`;
    });

  // Remove the temporary file
  project.removeSourceFile(sourceFile);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Function to extract all twoslash snippets from markdown files and validate them
async function extractAndValidateTwoslashSnippets() {
  console.log("Starting twoslash snippet extraction and validation...");

  // Find all .md and .mdx files in docs directory
  const docsPath = path.join(__dirname, "..");
  console.log(`Looking for markdown files in: ${path.join(docsPath, "docs")}`);

  // Use a recursive function instead of recursive option since it's causing type issues
  function findMarkdownFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const docsDir = path.join(docsPath, "docs");
  const allFiles = findMarkdownFiles(docsDir);
  console.log(`Found ${allFiles.length} markdown files to scan`);

  const files = allFiles.map((file) => file.substring(docsPath.length + 1));

  const results: {
    file: string;
    snippets: Array<{
      code: string;
      validationResult: SnippetValidationResult;
    }>;
    hasErrors: boolean;
  }[] = [];

  let totalSnippets = 0;
  let totalInvalidSnippets = 0;

  let fileCounter = 0;
  const totalFiles = files.length;

  for (const relativeFilePath of files) {
    fileCounter++;
    const filePath = path.join(docsPath, relativeFilePath);
    console.log(
      `[${fileCounter}/${totalFiles}] Scanning file: ${relativeFilePath}`
    );
    const content = fs.readFileSync(filePath, "utf-8");

    const fileSnippets: Array<{
      code: string;
      validationResult: SnippetValidationResult;
    }> = [];

    let match;
    let hasFileErrors = false;

    // Reset the regex index for each file
    twoslashRegex.lastIndex = 0;

    let snippetCounter = 0;

    while ((match = twoslashRegex.exec(content)) !== null) {
      snippetCounter++;
      const codeSnippet = match[1];

      // Skip empty code snippets
      if (codeSnippet && codeSnippet.trim() !== "") {
        const trimmedSnippet = codeSnippet.trim();
        console.log(
          `  → Validating snippet #${snippetCounter} (${trimmedSnippet.length} characters)`
        );
        const validationResult = validateTypeScriptSnippet(trimmedSnippet);

        totalSnippets++;
        if (!validationResult.isValid) {
          totalInvalidSnippets++;
          hasFileErrors = true;
          console.log(
            `    ❌ FAILED with ${validationResult.errors.length} error(s) in ${relativeFilePath}`
          );
        } else {
          console.log("    ✅ PASSED");
        }

        fileSnippets.push({
          code: trimmedSnippet,
          validationResult,
        });
      }
    }

    if (fileSnippets.length > 0) {
      console.log(
        `  Found ${fileSnippets.length} snippets in file, ${
          hasFileErrors ? "with errors" : "all valid"
        }`
      );
      results.push({
        file: relativeFilePath,
        snippets: fileSnippets,
        hasErrors: hasFileErrors,
      });
    } else {
      console.log("  No snippets found in this file");
    }
  }

  return {
    results,
    summary: {
      totalFiles: results.length,
      totalSnippets,
      invalidSnippets: totalInvalidSnippets,
      filesWithErrors: results.filter((r) => r.hasErrors).length,
    },
  };
}

// Run the extraction and validation
console.log(
  "Loading TypeScript configuration from:",
  path.join(__dirname, "..", "tsconfig.json")
);

extractAndValidateTwoslashSnippets()
  .then((result) => {
    console.log("\n=== VALIDATION COMPLETE ===\n");
    const { results, summary } = result;

    console.log(
      `Found ${summary.totalSnippets} twoslash snippets in ${summary.totalFiles} files.`
    );
    console.log(
      `${summary.invalidSnippets} snippets have compilation errors in ${summary.filesWithErrors} files.`
    );

    // Output detailed results for files with errors
    const filesWithErrors = results.filter((file) => file.hasErrors);

    if (filesWithErrors.length > 0) {
      console.log("\nFiles with TypeScript compilation errors:");

      for (const file of filesWithErrors) {
        console.log(`\nFile: ${file.file}`);

        for (let i = 0; i < file.snippets.length; i++) {
          const { code, validationResult } = file.snippets[i]!;

          if (!validationResult.isValid) {
            console.log(`\n  Snippet #${i + 1} in ${file.file}:`);
            console.log("  Errors:");
            validationResult.errors.forEach((error) => {
              console.log(`    - ${error}`);
            });
            console.log("\n  Code snippet:");
            console.log(`  ${code.split("\n").join("\n  ")}`);
          }
        }
      }

      // Exit with error if any invalid snippets are found
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Error extracting or validating snippets:", error);
    process.exit(1);
  });
