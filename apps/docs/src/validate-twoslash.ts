import * as fs from "fs";
import * as path from "path";

// Regex to extract code blocks with ```tsx twoslash
const twoslashRegex = /```tsx twoslash\n([\s\S]*?)```/g;

// Function to extract all twoslash snippets from markdown files
async function extractTwoslashSnippets() {
  // Find all .md and .mdx files in docs directory
  const docsPath = path.join(__dirname, "..");

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
  const files = findMarkdownFiles(docsDir).map((file) =>
    file.substring(docsPath.length + 1)
  );

  const results: { file: string; snippets: string[] }[] = [];

  for (const relativeFilePath of files) {
    const filePath = path.join(docsPath, relativeFilePath);
    const content = fs.readFileSync(filePath, "utf-8");

    const snippets: string[] = [];
    let match;

    // Reset the regex index for each file
    twoslashRegex.lastIndex = 0;

    while ((match = twoslashRegex.exec(content)) !== null) {
      const codeSnippet = match[1];

      // Skip empty code snippets
      if (codeSnippet && codeSnippet.trim() !== "") {
        snippets.push(codeSnippet.trim());
      }
    }

    if (snippets.length > 0) {
      results.push({
        file: relativeFilePath,
        snippets,
      });
    }
  }

  return results;
}

// Run the extraction
extractTwoslashSnippets()
  .then((results) => {
    console.log(
      `Found ${results.reduce(
        (total, file) => total + file.snippets.length,
        0
      )} twoslash snippets in ${results.length} files:`
    );
    console.log(JSON.stringify(results, null, 2));
  })
  .catch((error) => {
    console.error("Error extracting snippets:", error);
    process.exit(1);
  });
