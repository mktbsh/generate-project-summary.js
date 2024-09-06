import { stdin, stdout } from "node:process";
import * as readline from "node:readline/promises";
import { generateProjectSummary } from "./generate";

const rl = readline.createInterface({ input: stdin, output: stdout });

async function main() {
	const result = await rl.question(
		"Enter the project directory path (leave blank for current directory):",
	);

	let ext =
		(await rl.question("export file type (leave blank for txt):")) || "txt";
	if (!["md", "txt"].includes(ext)) {
		ext = "txt";
	}

	const projectDirectory = result || process.cwd();
	await generateProjectSummary(projectDirectory, ext as "txt" | "md");
	process.exit(0);
}

main();
