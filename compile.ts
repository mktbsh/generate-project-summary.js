import { $ } from "bun";

await $`rm -rfv dist`;
await $`mkdir -p dist`;

const targets = [
	"linux-x64",
	"linux-arm64",
	"windows-x64",
	"darwin-arm64",
	"darwin-x64",
];

for (const targetName of targets) {
	const target = `bun-${targetName}`;
	await $`bun build ./cli.ts --compile --target=${target} --minify --outfile dist/${targetName}/generate-project-summary`;
}
