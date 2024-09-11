import path from "node:path";
import fs from "node:fs/promises";
import { readGitIgnore, readGptIgnore } from "./ignore";
import { isBinary, isIgnored } from "./is";
import { readFileContents } from "./content";

export async function generateProjectSummary(
  projectDir: string,
  exportFileType: "txt" | "md" = "txt"
): Promise<void> {
  const projectName = path.basename(projectDir);
  const fileName = `${projectName}_project_summary.${exportFileType}`;

  const patterns = {
    git: await readGitIgnore(projectDir),
    gpt: await readGptIgnore(projectDir),
    additional: [".gptignore", ".git", "projsum-gen", fileName],
  };

  let summary = `# ${projectName}\n\n## Directory Structure\n\n`;
  let fileContentsSection = "\n## File Contents\n\n";

  function isIgnoredEntry(entryPath: string): boolean {
    return isIgnored({
      filePath: entryPath,
      projectDir,
      ignorePatterns: patterns,
    });
  }

  async function traverseDirectory(root: string, level: number): Promise<void> {
    const filePath = path.relative(projectDir, root);

    if (isIgnoredEntry(filePath)) return;

    summary += `${indent(level)}- ${path.basename(root)}/\n`;

    const subIndent = indent(level + 1);
    const items = await fs.readdir(root, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(root, item.name);

      if (item.isDirectory()) {
        const ignored = isIgnoredEntry(itemPath);
        if (ignored) continue;

        await traverseDirectory(itemPath, level + 1);
        continue;
      }

      if (isIgnoredEntry(itemPath)) continue;

      const file = Bun.file(itemPath);
      const arr = await file.arrayBuffer();
      const buffer = Buffer.from(arr);
      if (isBinary(buffer)) {
        summary += `${subIndent}- ${item.name} (binary file)\n`;
      } else {
        summary += `${subIndent}- ${item.name}\n`;
        const content = await readFileContents(itemPath);
        if (content.trim()) {
          const relativeFilePath = path.relative(projectDir, itemPath);
          fileContentsSection += `### ${relativeFilePath}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
        }
      }
    }
  }

  await traverseDirectory(projectDir, 0);

  await Bun.write(fileName, summary + fileContentsSection);
}

function indent(count: number) {
  return "  ".repeat(count);
}
