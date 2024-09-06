import * as jschardet from "jschardet";

export async function readFileContents(filePath: string): Promise<string> {
	const file = Bun.file(filePath);
	const arr = await file.arrayBuffer();
	const buffer = Buffer.from(arr);

	const encoding = jschardet.detect(buffer);
	if (encoding == null) return "";

	try {
		return buffer.toString(encoding.encoding as BufferEncoding);
	} catch (err) {
		console.error(`Error reading file ${filePath}: ${err}`);
		return "";
	}
}
