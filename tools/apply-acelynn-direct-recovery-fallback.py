from pathlib import Path

PATH = Path("android-packager/app/src/main/java/com/cactusbyte/wrapper/MainActivity.java")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


text = PATH.read_text(encoding="utf-8")

text = replace_once(
    text,
    "import android.app.Activity;\n",
    "import android.app.Activity;\nimport android.app.AlertDialog;\n",
    "AlertDialog import",
)
text = replace_once(
    text,
    "import android.graphics.Color;\n",
    "import android.graphics.Bitmap;\nimport android.graphics.Color;\n",
    "Bitmap import",
)

text = replace_once(
    text,
    "    private static final int QA_MAX_JSON_BYTES = 6 * 1024 * 1024;\n"
    "    private static final String QA_ASSET_HOST = \"appassets.androidplatform.net\";\n",
    "    private static final int QA_MAX_JSON_BYTES = 6 * 1024 * 1024;\n"
    "    private static final String QA_ASSET_HOST = \"appassets.androidplatform.net\";\n"
    "    private static final int ACELYNN_RECOVERY_MAX_JSON_BYTES = 6 * 1024 * 1024;\n"
    "    private static final String ACELYNN_DIRECT_PACKAGE = \"com.cactusbyte.acelynnpro\";\n"
    "    private static final String ACELYNN_PRODUCTION_HOST = \"acelynn.vercel.app\";\n"
    "    private static final String ACELYNN_RECOVERY_PATH = \"/__cactusbyte_recovery__/\";\n"
    "    private static final String ACELYNN_RECOVERY_URL = \"https://\" + ACELYNN_PRODUCTION_HOST + ACELYNN_RECOVERY_PATH + \"index.html\";\n"
    "    private static final String ACELYNN_RECOVERY_PREFS = \"acelynn-cutover-recovery\";\n"
    "    private static final String ACELYNN_RECOVERY_DECISION_KEY = \"decision-complete\";\n",
    "Acelynn recovery constants",
)

text = replace_once(
    text,
    "    private boolean qaMode;\n"
    "    private WebViewAssetLoader qaAssetLoader;\n",
    "    private boolean qaMode;\n"
    "    private WebViewAssetLoader qaAssetLoader;\n"
    "    private boolean acelynnDirectRecoveryMode;\n"
    "    private WebViewAssetLoader acelynnRecoveryAssetLoader;\n"
    "    private boolean acelynnRecoveryBridgeActive;\n"
    "    private boolean acelynnRecoveryPromptVisible;\n",
    "Acelynn recovery fields",
)

text = replace_once(
    text,
    "        qaMode = \"qa\".equals(BuildConfig.CHANNEL);\n"
    "        webView = new WebView(this);\n",
    "        qaMode = \"qa\".equals(BuildConfig.CHANNEL);\n"
    "        acelynnDirectRecoveryMode = !qaMode\n"
    "                && \"direct\".equals(BuildConfig.CHANNEL)\n"
    "                && ACELYNN_DIRECT_PACKAGE.equals(getPackageName());\n"
    "        webView = new WebView(this);\n",
    "Acelynn Direct mode initialization",
)

text = replace_once(
    text,
    "        } else {\n"
    "            setContentView(webView);\n"
    "        }\n\n"
    "        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {\n",
    "        } else {\n"
    "            setContentView(webView);\n"
    "        }\n"
    "        if (acelynnDirectRecoveryMode) {\n"
    "            acelynnRecoveryAssetLoader = new WebViewAssetLoader.Builder()\n"
    "                    .setDomain(ACELYNN_PRODUCTION_HOST)\n"
    "                    .addPathHandler(ACELYNN_RECOVERY_PATH, new WebViewAssetLoader.AssetsPathHandler(this))\n"
    "                    .build();\n"
    "        }\n\n"
    "        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {\n",
    "Acelynn same-origin asset loader",
)

text = replace_once(
    text,
    "            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {\n"
    "                if (qaMode && qaAssetLoader != null) {\n",
    "            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {\n"
    "                if (acelynnDirectRecoveryMode && acelynnRecoveryAssetLoader != null) {\n"
    "                    WebResourceResponse local = acelynnRecoveryAssetLoader.shouldInterceptRequest(request.getUrl());\n"
    "                    if (local != null) return local;\n"
    "                }\n"
    "                if (qaMode && qaAssetLoader != null) {\n",
    "Acelynn recovery interception",
)

text = replace_once(
    text,
    "            @Override\n"
    "            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {\n",
    "            @Override\n"
    "            public void onPageStarted(WebView view, String url, Bitmap favicon) {\n"
    "                super.onPageStarted(view, url, favicon);\n"
    "                if (acelynnDirectRecoveryMode && !isAcelynnRecoveryUrl(url)) {\n"
    "                    disableAcelynnRecoveryBridge();\n"
    "                }\n"
    "            }\n\n"
    "            @Override\n"
    "            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {\n",
    "Acelynn bridge lifecycle",
)

text = replace_once(
    text,
    "                if (qaMode && url != null && url.startsWith(\"https://\" + QA_ASSET_HOST + \"/\")) {\n"
    "                    installQaDownloadBridge();\n"
    "                }\n",
    "                if (qaMode && url != null && url.startsWith(\"https://\" + QA_ASSET_HOST + \"/\")) {\n"
    "                    installQaDownloadBridge();\n"
    "                }\n"
    "                if (acelynnDirectRecoveryMode && isAcelynnRecoveryUrl(url)) {\n"
    "                    installAcelynnRecoveryHooks();\n"
    "                }\n",
    "Acelynn recovery page hook installation",
)

text = replace_once(
    text,
    "        if (savedInstanceState == null) {\n"
    "            webView.loadUrl(BuildConfig.START_URL);\n"
    "        } else {\n"
    "            webView.restoreState(savedInstanceState);\n"
    "        }\n",
    "        if (savedInstanceState == null) {\n"
    "            if (shouldOfferAcelynnPreLaunchRecovery()) showAcelynnPreLaunchRecoveryPrompt();\n"
    "            else webView.loadUrl(BuildConfig.START_URL);\n"
    "        } else {\n"
    "            webView.restoreState(savedInstanceState);\n"
    "        }\n",
    "Acelynn pre-launch recovery gate",
)

acelynn_methods = r'''
    private boolean shouldOfferAcelynnPreLaunchRecovery() {
        return acelynnDirectRecoveryMode
                && !getSharedPreferences(ACELYNN_RECOVERY_PREFS, MODE_PRIVATE)
                .getBoolean(ACELYNN_RECOVERY_DECISION_KEY, false);
    }

    private void showAcelynnPreLaunchRecoveryPrompt() {
        if (!acelynnDirectRecoveryMode || acelynnRecoveryPromptVisible) return;
        acelynnRecoveryPromptVisible = true;
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("Restore Acelynn Pro backup?")
                .setMessage("This permanent Acelynn Pro install starts with fresh app storage. If you exported saved mix checks before the signing update, restore them now using the certified recovery copy built into this APK.")
                .setPositiveButton("Restore backup", (ignored, which) -> {
                    acelynnRecoveryPromptVisible = false;
                    openAcelynnRecoveryFallback();
                })
                .setNegativeButton("Continue without backup", (ignored, which) -> {
                    acelynnRecoveryPromptVisible = false;
                    markAcelynnRecoveryDecisionComplete();
                    webView.loadUrl(BuildConfig.START_URL);
                })
                .setNeutralButton("Exit for now", (ignored, which) -> {
                    acelynnRecoveryPromptVisible = false;
                    finish();
                })
                .create();
        dialog.setOnCancelListener(ignored -> {
            acelynnRecoveryPromptVisible = false;
            finish();
        });
        dialog.show();
    }

    private void markAcelynnRecoveryDecisionComplete() {
        getSharedPreferences(ACELYNN_RECOVERY_PREFS, MODE_PRIVATE)
                .edit()
                .putBoolean(ACELYNN_RECOVERY_DECISION_KEY, true)
                .apply();
    }

    private void openAcelynnRecoveryFallback() {
        if (!acelynnDirectRecoveryMode) return;
        disableAcelynnRecoveryBridge();
        webView.addJavascriptInterface(new AcelynnRecoveryDownloadBridge(), "CactusRecoveryBridge");
        acelynnRecoveryBridgeActive = true;
        webView.loadUrl(ACELYNN_RECOVERY_URL);
    }

    private boolean isAcelynnRecoveryUrl(String value) {
        if (value == null) return false;
        Uri uri;
        try {
            uri = Uri.parse(value);
        } catch (RuntimeException ex) {
            return false;
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
        if (!ACELYNN_PRODUCTION_HOST.equalsIgnoreCase(uri.getHost())) return false;
        int port = uri.getPort();
        return (port == -1 || port == 443)
                && uri.getPath() != null
                && uri.getPath().startsWith(ACELYNN_RECOVERY_PATH);
    }

    private boolean isAllowedAcelynnPermissionOrigin(Uri origin) {
        if (origin == null || !"https".equalsIgnoreCase(origin.getScheme())) return false;
        if (!ACELYNN_PRODUCTION_HOST.equalsIgnoreCase(origin.getHost())) return false;
        int port = origin.getPort();
        return port == -1 || port == 443;
    }

    private boolean requestsOnlyAcelynnAudio(PermissionRequest request) {
        String[] resources = request.getResources();
        if (resources.length != 1) return false;
        return PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resources[0]);
    }

    private void installAcelynnRecoveryHooks() {
        if (!acelynnRecoveryBridgeActive) return;
        String script = "(function(){" +
                "if(!window.CactusRecoveryBridge)return;" +
                "if(!window.__cactusRecoveryDownloadBridgeInstalled){" +
                "var nativeClick=HTMLAnchorElement.prototype.click;" +
                "HTMLAnchorElement.prototype.click=function(){var a=this;" +
                "if(a.download&&typeof a.href==='string'&&a.href.indexOf('blob:')===0){" +
                "fetch(a.href).then(function(r){return r.text();}).then(function(t){window.CactusRecoveryBridge.saveJson(a.download,t);}).catch(function(){nativeClick.call(a);});return;}" +
                "return nativeClick.call(a);};window.__cactusRecoveryDownloadBridgeInstalled=true;}" +
                "if(window.AcelynnRecovery&&!window.__cactusRecoveryResultBridgeInstalled){" +
                "var originalRestore=window.AcelynnRecovery.restore;" +
                "window.AcelynnRecovery.restore=function(storage,backupValues){var result=originalRestore(storage,backupValues);" +
                "try{window.CactusRecoveryBridge.recoverySucceeded(result.length);}catch(e){}return result;};" +
                "window.__cactusRecoveryResultBridgeInstalled=true;}" +
                "if(!document.getElementById('cactusbyte-recovery-banner')){" +
                "var banner=document.createElement('div');banner.id='cactusbyte-recovery-banner';" +
                "banner.textContent='Built-in Recovery · certified 6363059183ce';" +
                "banner.style.cssText='position:sticky;top:0;z-index:2147483647;padding:10px 12px;text-align:center;background:#ffe27a;color:#15120a;font:800 12px system-ui;border-bottom:1px solid #ba9a35';" +
                "document.body.insertBefore(banner,document.body.firstChild);}" +
                "if(!document.getElementById('cactusbyte-recovery-continue')){" +
                "var go=document.createElement('button');go.id='cactusbyte-recovery-continue';go.textContent='Continue to Acelynn Pro';" +
                "go.style.cssText='display:none;position:fixed;left:16px;right:16px;bottom:18px;z-index:2147483647;min-height:52px;border:0;border-radius:14px;background:#78f0b1;color:#071218;font:900 15px system-ui;box-shadow:0 8px 28px #0008';" +
                "go.onclick=function(){location.href='" + BuildConfig.START_URL + "';};document.body.appendChild(go);}" +
                "})();";
        webView.evaluateJavascript(script, null);
    }

    private void disableAcelynnRecoveryBridge() {
        if (!acelynnRecoveryBridgeActive || webView == null) return;
        webView.removeJavascriptInterface("CactusRecoveryBridge");
        acelynnRecoveryBridgeActive = false;
    }

    private final class AcelynnRecoveryDownloadBridge {
        @JavascriptInterface
        public void saveJson(String requestedName, String json) {
            if (!acelynnDirectRecoveryMode || !acelynnRecoveryBridgeActive || json == null) return;
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            if (bytes.length == 0 || bytes.length > ACELYNN_RECOVERY_MAX_JSON_BYTES) {
                postToast("Acelynn recovery backup was not saved: invalid file size.");
                return;
            }
            String safeName = sanitizeQaFileName(requestedName);
            if (!safeName.startsWith("acelynn-pro-")) safeName = "acelynn-pro-recovery.json";
            try {
                String location = writeAcelynnRecoveryJson(safeName, bytes);
                postToast("Saved " + safeName + " to " + location);
            } catch (IOException | SecurityException ex) {
                postToast("Acelynn recovery backup could not be saved.");
            }
        }

        @JavascriptInterface
        public void recoverySucceeded(int restoredCount) {
            if (!acelynnDirectRecoveryMode || !acelynnRecoveryBridgeActive) return;
            runOnUiThread(() -> {
                markAcelynnRecoveryDecisionComplete();
                Toast.makeText(MainActivity.this,
                        "Recovery complete: " + Math.max(0, restoredCount) + " saved checks. Continue when ready.",
                        Toast.LENGTH_LONG).show();
                webView.evaluateJavascript("(function(){var b=document.getElementById('cactusbyte-recovery-continue');if(b)b.style.display='block';})()", null);
            });
        }
    }

    private String writeAcelynnRecoveryJson(String fileName, byte[] bytes) throws IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
            values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/AcelynnProRecovery");
            values.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri item = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (item == null) throw new IOException("MediaStore insert failed");
            boolean success = false;
            try (OutputStream output = getContentResolver().openOutputStream(item, "w")) {
                if (output == null) throw new IOException("MediaStore output stream unavailable");
                output.write(bytes);
                output.flush();
                success = true;
            } finally {
                if (success) {
                    ContentValues publish = new ContentValues();
                    publish.put(MediaStore.Downloads.IS_PENDING, 0);
                    getContentResolver().update(item, publish, null, null);
                } else {
                    getContentResolver().delete(item, null, null);
                }
            }
            return "Downloads/AcelynnProRecovery";
        }

        File root = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (root == null) throw new IOException("External files directory unavailable");
        File dir = new File(root, "AcelynnProRecovery");
        if (!dir.exists() && !dir.mkdirs()) throw new IOException("Could not create recovery download directory");
        File target = new File(dir, fileName);
        try (OutputStream output = new FileOutputStream(target, false)) {
            output.write(bytes);
            output.flush();
        }
        return target.getAbsolutePath();
    }

'''

text = replace_once(
    text,
    "    private void setUpQaContentView() {\n",
    acelynn_methods + "    private void setUpQaContentView() {\n",
    "Acelynn recovery methods",
)

text = replace_once(
    text,
    "    private void handleWebPermission(PermissionRequest request) {\n"
    "        List<String> needed = new ArrayList<>();\n",
    "    private void handleWebPermission(PermissionRequest request) {\n"
    "        if (acelynnDirectRecoveryMode) {\n"
    "            if (!isAllowedAcelynnPermissionOrigin(request.getOrigin()) || !requestsOnlyAcelynnAudio(request)) {\n"
    "                request.deny();\n"
    "                return;\n"
    "            }\n"
    "            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {\n"
    "                request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});\n"
    "                return;\n"
    "            }\n"
    "            pendingWebPermission = request;\n"
    "            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_WEB_PERMISSIONS);\n"
    "            return;\n"
    "        }\n"
    "        List<String> needed = new ArrayList<>();\n",
    "Acelynn strict microphone bridge",
)

text = replace_once(
    text,
    "        if (requestCode == REQUEST_WEB_PERMISSIONS && pendingWebPermission != null) {\n"
    "            if (granted) pendingWebPermission.grant(pendingWebPermission.getResources());\n"
    "            else pendingWebPermission.deny();\n"
    "            pendingWebPermission = null;\n"
    "        }\n",
    "        if (requestCode == REQUEST_WEB_PERMISSIONS && pendingWebPermission != null) {\n"
    "            if (acelynnDirectRecoveryMode) {\n"
    "                if (granted && isAllowedAcelynnPermissionOrigin(pendingWebPermission.getOrigin())\n"
    "                        && requestsOnlyAcelynnAudio(pendingWebPermission)) {\n"
    "                    pendingWebPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});\n"
    "                } else {\n"
    "                    pendingWebPermission.deny();\n"
    "                }\n"
    "            } else if (granted) pendingWebPermission.grant(pendingWebPermission.getResources());\n"
    "            else pendingWebPermission.deny();\n"
    "            pendingWebPermission = null;\n"
    "        }\n",
    "Acelynn runtime microphone grant",
)

# Contract assertions prevent accidental partial application or unsafe origins.
required = [
    "setDomain(ACELYNN_PRODUCTION_HOST)",
    "ACELYNN_RECOVERY_PATH",
    "Built-in Recovery · certified 6363059183ce",
    "Restore Acelynn Pro backup?",
    "Continue without backup",
    "PermissionRequest.RESOURCE_AUDIO_CAPTURE",
    "Downloads/AcelynnProRecovery",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"missing Acelynn Direct recovery contract: {needle}")

for forbidden in ["file:///android_asset/recovery", "local://recovery"]:
    if forbidden in text:
        raise SystemExit(f"unsafe cross-origin recovery path found: {forbidden}")

PATH.write_text(text, encoding="utf-8")
print("Acelynn Direct same-origin recovery fallback applied.")
