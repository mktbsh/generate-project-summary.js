import path from "node:path";
import { minimatch } from "minimatch";

interface IsIgnoredOptions {
	filePath: string;
	projectDir: string;
	ignorePatterns: {
		git: string[];
		gpt: string[];
		additional?: string[];
	};
}

export function isIgnored({
	filePath,
	projectDir,
	ignorePatterns,
}: IsIgnoredOptions): boolean {
	const { git, gpt, additional = [] } = ignorePatterns;
	const relativePath = path.relative(projectDir, filePath);

	if (relativePath === "") return false;

	const patterns = [...git, ...gpt, ...additional];

	const normalizedPath = relativePath.split(path.sep).join("/");

	for (const pattern of patterns) {
		if (
			minimatch(normalizedPath, `*${pattern}*`, { matchBase: true, dot: true })
		) {
			return true;
		}
	}

	return false;
}

export function isBinary(buffer: Buffer): boolean {
	return buffer.includes(0);
}
