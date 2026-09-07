#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const expectedPackage = 'com.cactusbyte.acelynnpro.renderqa';
const expectedLabel = 'Acelynn Pro Render QA';
const expectedSource = '85987cd5d6b8020ac9aa15c8b98bc515a13aabdb';
const expectedStartUrl = 'https://appassets.androidplatform.net/assets/acelynnrenderqa/index.html';
const assetRoot = 'android-packager/app/src/acelynnproRenderqaDebug/assets/acelynnrenderqa';
const gradle = readFileSync('android-packager/app/build.gradle.kts', 'utf8');
const manifest = readFileSync('android-packager/app/src/acelynnproRenderqaDebug/AndroidManifest.xml', 'utf8');

function fail(message) {
  console.error(`Render QA guard failed: ${message}`);
  process.exit(1);
}

for (const token of [
  'create("renderqa")',
  'applicationIdSuffix = ".renderqa"',
  `ResValue("${expectedLabel}"`,
  `\\"${expectedStartUrl}\\"`,
  'signingConfig = signingConfigs.getByName("debug")'
]) {
  if (!gradle.includes(token)) fail(`Gradle contract missing ${token}`);
}

if (!manifest.includes('android:label="@string/app_name"')) fail('Render QA manifest label is not resource-controlled.');

const pin = JSON.parse(readFileSync(join(assetRoot, 'PINNED_SOURCE.json'), 'utf8'));
if (pin.sourceCommit !== expectedSource) fail(`source pin mismatch: ${pin.sourceCommit}`);
if (pin.packageId !== expectedPackage) fail(`package pin mismatch: ${pin.packageId}`);
if (pin.entryPoint !== expectedStartUrl) fail(`entry point mismatch: ${pin.entryPoint}`);
if (pin.productionUrlPackaged !== false || pin.serviceWorkerPackaged !== false) fail('local-only safety flags are not false.');

for (const relative of [
  'index.html',
  'acelynn-recovery.js',
  'manifest.json',
  'acelynnpro.png',
  'js/live-state.js',
  'js/live-renderer.js',
  'js/live-controller.js',
  'js/live-app.js',
  'js/runtime.js',
  'js/ui-enhancements.js',
  'js/static-shell-bootstrap.js',
  'js/full-state-backup.js',
  'js/full-state-backup-ui.js'
]) {
  try {
    if (!statSync(join(assetRoot, relative)).isFile()) fail(`required asset is not a file: ${relative}`);
  } catch {
    fail(`required asset missing: ${relative}`);
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const forbidden = [
  'https://acelynn.vercel.app/',
  'navigator.serviceWorker.register',
  'CactusRecoveryBridge',
  'permanent-acelynnpro',
  'live-stability.js',
  'webview-performance.js',
  'legacy-export-bridge.js'
];

for (const path of walk(assetRoot)) {
  if (/\.(png|jpg|jpeg|webp)$/i.test(path)) continue;
  const text = readFileSync(path, 'utf8');
  for (const token of forbidden) {
    if (text.includes(token)) fail(`${path} contains forbidden token ${token}`);
  }
}

console.log('Acelynn Render QA static contract is GREEN.');
