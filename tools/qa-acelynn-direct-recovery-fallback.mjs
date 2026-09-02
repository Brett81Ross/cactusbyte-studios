import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const mainActivity = fs.readFileSync('android-packager/app/src/main/java/com/cactusbyte/wrapper/MainActivity.java', 'utf8');
const manifest = fs.readFileSync('android-packager/app/src/acelynnproDirect/AndroidManifest.xml', 'utf8');
const indexPath = 'android-packager/app/src/acelynnproDirect/assets/index.html';
const recoveryPath = 'android-packager/app/src/acelynnproDirect/assets/acelynn-recovery.js';
const qaIndexPath = 'android-packager/app/src/acelynnproQaDebug/assets/acelynnqa/index.html';
const qaRecoveryPath = 'android-packager/app/src/acelynnproQaDebug/assets/acelynnqa/acelynn-recovery.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function includes(text, needle, label) {
  assert(text.includes(needle), `Missing ${label}: ${needle}`);
}
function gitHash(path) {
  return execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim();
}

assert(fs.existsSync(indexPath), 'Acelynn Direct certified index.html is missing');
assert(fs.existsSync(recoveryPath), 'Acelynn Direct certified acelynn-recovery.js is missing');
assert(gitHash(indexPath) === 'f61201e13b6e001f49d0718b33a4072e6bf7704f', 'Direct index.html is not the certified 6363059183ce blob');
assert(gitHash(recoveryPath) === '2f29bec84322b3e457cf41162ae970d7907b5f31', 'Direct acelynn-recovery.js is not the certified 6363059183ce blob');
assert(gitHash(indexPath) === gitHash(qaIndexPath), 'Direct and physically tested QA index.html differ');
assert(gitHash(recoveryPath) === gitHash(qaRecoveryPath), 'Direct and physically tested QA recovery engine differ');

includes(manifest, 'android.permission.MODIFY_AUDIO_SETTINGS', 'Acelynn Direct audio-settings permission');
includes(mainActivity, 'ACELYNN_DIRECT_PACKAGE = "com.cactusbyte.acelynnpro"', 'Acelynn Direct package allowlist');
includes(mainActivity, 'ACELYNN_PRODUCTION_HOST = "acelynn.vercel.app"', 'Acelynn production host allowlist');
includes(mainActivity, 'ACELYNN_RECOVERY_PATH = "/__cactusbyte_recovery__/"', 'reserved recovery path');
includes(mainActivity, '.setDomain(ACELYNN_PRODUCTION_HOST)', 'same-origin WebViewAssetLoader domain');
includes(mainActivity, '.addPathHandler(ACELYNN_RECOVERY_PATH', 'same-origin recovery path handler');
includes(mainActivity, 'shouldOfferAcelynnPreLaunchRecovery()', 'pre-live recovery prompt');
includes(mainActivity, 'Restore Acelynn Pro backup?', 'fresh-install restore prompt');
includes(mainActivity, 'Continue without backup', 'explicit start-fresh choice');
includes(mainActivity, 'Exit for now', 'safe defer choice without loading production');
includes(mainActivity, 'CactusRecoveryBridge', 'recovery-only native bridge');
includes(mainActivity, 'disableAcelynnRecoveryBridge()', 'bridge removal before live navigation');
includes(mainActivity, 'request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE})', 'audio-only WebView permission grant');
includes(mainActivity, 'Downloads/AcelynnProRecovery', 'native safety-backup destination');
includes(mainActivity, 'Built-in Recovery · certified 6363059183ce', 'certified fallback banner');
includes(mainActivity, "go.onclick=function(){location.href='", 'explicit return-to-live action');

assert(!mainActivity.includes('file:///android_asset/recovery'), 'file:// recovery would split localStorage origin');
assert(!mainActivity.includes('local://recovery'), 'custom-scheme recovery would split localStorage origin');
assert(!fs.existsSync('android-packager/app/src/direct/assets'), 'Recovery assets must not be shared across every Direct brand');
assert(!fs.existsSync('android-packager/app/src/acelynnproPlay/assets'), 'Play flavor must not contain the Direct recovery fallback');

const certifiedIndex = fs.readFileSync(indexPath, 'utf8');
includes(certifiedIndex, '<script src="acelynn-recovery.js"></script>', 'certified recovery engine mount');
includes(certifiedIndex, 'Restore / merge backup', 'certified recovery UI');
includes(certifiedIndex, 'acelynn-pro-pre-import-backup.json', 'pre-import safety backup');
includes(certifiedIndex, 'retireLegacyServiceWorker()', 'service-worker retirement');
assert(!certifiedIndex.includes('serviceWorker.register('), 'Certified fallback must not register a service worker');

console.log('Acelynn Direct same-origin recovery fallback source QA passed.');
