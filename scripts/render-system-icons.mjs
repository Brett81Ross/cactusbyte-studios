import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "public/cactusbyte-system-icon.svg");
const outputs = [
  [180, "apple-touch-icon.png"],
  [192, "icon-192.png"],
  [512, "icon-512.png"],
];

const svg = await readFile(source);
for (const [size, name] of outputs) {
  await sharp(svg).resize(size, size).png().toFile(resolve(root, "public", name));
  console.log(`Rendered ${name} (${size}x${size})`);
}
