#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SOURCE_COMMIT = '62c6fd3f0d7fb20c0d77913d044e00fc2cd4441d';
const sourceRoot = process.env.ACELYNN_RENDER_QA_SOURCE || 'acelynn-source';
const destRoot = 'android-packager/app/src/acelynnproRenderqaDebug/assets/acelynnrenderqa';
const assetPrefix = '/assets/acelynnrenderqa';

const files = [
  'index.html',
  'acelynn-recovery.js',
  'manifest.json',
  'acelynnpro.png',
  'js/meta.js',
  'js/db.js',
  'js/storage.js',
  'js/migration.js',
  'js/spectral.js',
  'js/insights.js',
  'js/runtime.js',
  'js/ui-enhancements.js',
  'js/live-state.js',
  'js/live-renderer.js',
  'js/live-controller.js',
  'js/live-app.js',
  'js/full-state-backup.js',
  'js/full-state-backup-ui.js',
  'js/static-shell-bootstrap.js'
];

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function assertPinnedSource() {
  const actual = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (actual !== SOURCE_COMMIT) {
    throw new Error(`Render QA source mismatch: expected ${SOURCE_COMMIT}, got ${actual}`);
  }
}

function copyPinnedFiles() {
  rmSync(destRoot, { recursive: true, force: true });
  mkdirSync(destRoot, { recursive: true });
  for (const relative of files) {
    const source = join(sourceRoot, relative);
    const dest = join(destRoot, relative);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(source, dest);
  }
}

function rewriteIndex() {
  const path = join(destRoot, 'index.html');
  let html = readFileSync(path, 'utf8');
  html = html
    .replaceAll('src="/acelynnpro.png"', `src="${assetPrefix}/acelynnpro.png"`)
    .replaceAll('src="/js/', `src="${assetPrefix}/js/`)
    .replaceAll('src="/acelynn-recovery.js"', `src="${assetPrefix}/acelynn-recovery.js"`)
    .replace(
      '<script src="/legacy-export-bridge.js?v=cutover1"></script>',
      `<script type="module" src="${assetPrefix}/js/static-shell-bootstrap.js"></script>`
    );
  writeFileSync(path, html);
}

function rewriteStaticShellBootstrap() {
  const path = join(destRoot, 'js/static-shell-bootstrap.js');
  let source = readFileSync(path, 'utf8');
  source = source.replace(
    "  '/js/full-state-backup-ui.js',\n  '/demo-help.js'",
    `  '${assetPrefix}/js/full-state-backup-ui.js'`
  );
  if (source.includes("'/demo-help.js'")) {
    throw new Error('Render QA static-shell bootstrap still includes demo-help.js.');
  }
  writeFileSync(path, source);
}

function verifyLocalOnly() {
  const forbidden = [
    'https://',
    'navigator.serviceWorker.register',
    'CactusRecoveryBridge',
    'permanent-acelynnpro',
    'live-stability.js',
    'webview-performance.js',
    'legacy-export-bridge.js'
  ];

  for (const relative of files.filter(name => !name.endsWith('.png'))) {
    const text = readFileSync(join(destRoot, relative), 'utf8');
    for (const token of forbidden) {
      if (text.includes(token)) throw new Error(`${relative} contains forbidden Render QA token: ${token}`);
    }
    if (/['"]\/js\//.test(text) || /src=["']\/js\//.test(text)) {
      throw new Error(`${relative} still contains an un-rebased absolute /js/ path.`);
    }
  }

  const index = readFileSync(join(destRoot, 'index.html'), 'utf8');
  for (const required of [
    `${assetPrefix}/js/runtime.js`,
    `${assetPrefix}/js/ui-enhancements.js`,
    `${assetPrefix}/js/live-app.js`,
    `${assetPrefix}/js/static-shell-bootstrap.js`,
    `${assetPrefix}/acelynn-recovery.js`
  ]) {
    if (!index.includes(required)) throw new Error(`Render QA index is missing ${required}`);
  }
}

function writePinManifest() {
  const records = files.map(relative => {
    const data = readFileSync(join(destRoot, relative));
    return { path: relative, bytes: data.length, sha256: sha256(data) };
  });
  const manifest = {
    purpose: 'Acelynn Pro unified live renderer physical Fold QA',
    sourceRepository: 'Brett81Ross/Acelynn',
    sourceCommit: SOURCE_COMMIT,
    entryPoint: 'https://appassets.androidplatform.net/assets/acelynnrenderqa/index.html',
    packageId: 'com.cactusbyte.acelynnpro.renderqa',
    productionUrlPackaged: false,
    serviceWorkerPackaged: false,
    directRecoveryBridgePackaged: false,
    demoHelpPackaged: false,
    transformedForLocalAssetRoot: true,
    files: records
  };
  writeFileSync(join(destRoot, 'PINNED_SOURCE.json'), JSON.stringify(manifest, null, 2) + '\n');
}

assertPinnedSource();
copyPinnedFiles();
rewriteIndex();
rewriteStaticShellBootstrap();
verifyLocalOnly();
writePinManifest();
console.log(`Staged Acelynn Render QA assets from ${SOURCE_COMMIT}.`);
