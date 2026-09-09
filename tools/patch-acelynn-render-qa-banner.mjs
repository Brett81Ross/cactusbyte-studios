#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'android-packager/app/src/main/java/com/cactusbyte/wrapper/MainActivity.java';
const original = 'banner.setText("Acelynn Pro — Recovery QA Build · pinned 6363059183ce");';
const replacement = 'banner.setText(getPackageName().endsWith(".renderqa") ? "Acelynn Pro — Render QA · pinned 62c6fd3f0d7f" : "Acelynn Pro — Recovery QA Build · pinned 6363059183ce");';

let source = readFileSync(path, 'utf8');
if (source.includes(replacement)) {
  console.log('Render QA banner patch already applied in this worktree.');
  process.exit(0);
}
const count = source.split(original).length - 1;
if (count !== 1) throw new Error(`Expected exactly one Recovery QA banner assignment, found ${count}.`);
source = source.replace(original, replacement);
writeFileSync(path, source);
console.log('Applied isolated Render QA banner label in the build worktree.');
