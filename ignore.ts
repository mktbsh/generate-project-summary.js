import path from "node:path";

type IgnorePatterns = Array<string>;

type IgnorePatternsPromise = Promise<IgnorePatterns>;

const GIT_IGNORE = ".gitignore";
const GPT_IGNORE = ".gptignore";

export function readGitIgnore(projectDir: string): IgnorePatternsPromise {
	return readIgnoreFile(path.join(projectDir, GIT_IGNORE));
}

export function readGptIgnore(projectDir: string): IgnorePatternsPromise {
	return readIgnoreFile(path.join(projectDir, GPT_IGNORE));
}

async function readIgnoreFile(filePath: string): IgnorePatternsPromise {
	const file = Bun.file(filePath);

	if (!(await file.exists())) return [];
	const content = await file.text();
	return expandPatterns(content);
}

function expandPatterns(content: string): Array<string> {
	const patterns = content.split("\n").filter((line) => line.trim() && !line.startsWith("#"));

	const expandedPatterns: string[] = [];
	for (const pattern of patterns) {
		expandedPatterns.push(pattern);

		if (pattern.includes("/")) {
			expandedPatterns.push(pattern.replace(/\//g, "\\"));
		}

		if (pattern.includes("\\")) {
			expandedPatterns.push(pattern.replace(/\\/g, "/"));
		}
	}

	return expandedPatterns;
}
