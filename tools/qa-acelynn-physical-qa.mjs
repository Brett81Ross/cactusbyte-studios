import fs from 'node:fs';
import path from 'node:path';

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};
const check = (condition, message) => {
  if (!condition) fail(message);
};

const gradlePath = 'android-packager/app/build.gradle.kts';
const activityPath = 'android-packager/app/src/main/java/com/cactusbyte/wrapper/MainActivity.java';
const qaSourceRoot = 'android-packager/app/src/acelynnproQaDebug';
const assetRoot = path.join(qaSourceRoot, 'assets/acelynnqa');
const gradle = fs.readFileSync(gradlePath, 'utf8');
const activity = fs.readFileSync(activityPath, 'utf8');

check(gradle.includes('create("qa")'), 'qa distribution flavor is missing');
check(gradle.includes('applicationIdSuffix = ".qa"'), 'QA applicationId suffix is missing');
check(gradle.includes('buildConfigField("String", "CHANNEL", "\\"qa\\"")'), 'QA channel BuildConfig is missing');
check(gradle.includes('variantBuilder.enable = isAcelynnPro && variantBuilder.buildType == "debug"'), 'QA variant filter must enable only Acelynn Pro debug');
check(gradle.includes('https://appassets.androidplatform.net/assets/acelynnqa/index.html'), 'QA START_URL must use the local app-assets origin');
check(gradle.includes('ResValue("Acelynn Pro QA"'), 'QA app label override is missing');
check(gradle.includes('signingConfig = signingConfigs.getByName("debug")'), 'debug signing must be explicit');
check(gradle.includes('androidx.webkit:webkit:1.17.0'), 'AndroidX WebKit asset loader dependency is missing');

check(activity.includes('Acelynn Pro — Recovery QA Build · pinned 6363059183ce'), 'persistent QA banner is missing');
check(activity.includes('WebViewAssetLoader'), 'secure local asset loader is missing');
check(activity.includes('addJavascriptInterface(new QaDownloadBridge(), "CactusQaBridge")'), 'QA JSON download bridge is missing');
check(activity.includes('MediaStore.Downloads.RELATIVE_PATH'), 'QA JSON export must save through Android Downloads');
check(activity.includes('Downloads/AcelynnProQA'), 'QA download destination is not explicit');
check(activity.includes('window.__cactusQaDownloadBridgeInstalled'), 'blob-download interception is missing');
check(!activity.includes('https://acelynn.vercel.app'), 'MainActivity must not hardcode the production Acelynn URL');

for (const file of ['index.html', 'acelynn-recovery.js', 'manifest.json', 'acelynnpro.png', 'PINNED_SOURCE.json']) {
  check(fs.existsSync(path.join(assetRoot, file)), `pinned QA asset missing: ${file}`);
}
check(!fs.existsSync(path.join(assetRoot, 'sw.js')), 'service worker must not be packaged in the QA asset set');

const qaColorPath = path.join(qaSourceRoot, 'res/values/icon_colors.xml');
const qaForegroundPath = path.join(qaSourceRoot, 'res/drawable/app_icon_foreground.xml');
check(fs.existsSync(qaColorPath), 'QA-only adaptive icon background resource is missing');
check(fs.existsSync(qaForegroundPath), 'QA-only adaptive icon foreground resource is missing');
if (fs.existsSync(qaColorPath)) {
  const colors = fs.readFileSync(qaColorPath, 'utf8');
  check(colors.includes('<color name="icon_bg">#FFD54F</color>'), 'QA launcher background must use the warning color');
}
if (fs.existsSync(qaForegroundPath)) {
  const foreground = fs.readFileSync(qaForegroundPath, 'utf8');
  check(foreground.includes('android:pathData="M1,21h22L12,2 1,21z'), 'QA launcher warning foreground is missing');
}

if (fs.existsSync(path.join(assetRoot, 'PINNED_SOURCE.json'))) {
  const metadata = JSON.parse(fs.readFileSync(path.join(assetRoot, 'PINNED_SOURCE.json'), 'utf8'));
  check(metadata.sourceRepository === 'Brett81Ross/Acelynn', 'pinned source repository mismatch');
  check(metadata.sourceCommit === '6363059183cebe650830cc240d275936dc802d34', 'pinned Acelynn recovery commit mismatch');
  check(metadata.productionUrlPackaged === false, 'metadata must declare production URL absent');
  check(metadata.serviceWorkerPackaged === false, 'metadata must declare service worker absent');
  check(Array.isArray(metadata.files) && metadata.files.length === 4, 'pinned metadata must cover exactly four source assets');
  for (const item of metadata.files || []) {
    check(/^[a-f0-9]{64}$/.test(item.sha256 || ''), `SHA-256 missing for ${item.path || 'asset'}`);
  }
}

if (fs.existsSync(path.join(assetRoot, 'index.html'))) {
  const index = fs.readFileSync(path.join(assetRoot, 'index.html'), 'utf8');
  check(index.includes('<script src="acelynn-recovery.js"></script>'), 'pinned index must load the recovery engine');
  check(index.includes('min-height:48px'), 'pinned restore target must retain the 48px mobile gate');
  check(!index.includes('serviceWorker.register'), 'pinned index must not register a service worker');
  check(!index.includes('https://acelynn.vercel.app'), 'pinned index must not contain production Acelynn URL');
}

if (fs.existsSync(path.join(assetRoot, 'acelynn-recovery.js'))) {
  const recovery = fs.readFileSync(path.join(assetRoot, 'acelynn-recovery.js'), 'utf8');
  check(recovery.includes('const SCHEMA="acelynn-pro-backup-v1"'), 'recovery schema is missing');
  check(recovery.includes('const MAX_STORED_SNAPSHOTS=12'), '12-snapshot retention contract is missing');
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Acelynn Pro physical-QA variant contract passed.');
