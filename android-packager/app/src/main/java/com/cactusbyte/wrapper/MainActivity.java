package com.cactusbyte.wrapper;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.SafeBrowsingResponse;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Gravity;
import android.window.OnBackInvokedDispatcher;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final int REQUEST_WEB_PERMISSIONS = 4101;
    private static final int REQUEST_FILE_CHOOSER = 4102;
    private static final int REQUEST_GEO_PERMISSION = 4103;
    private static final int QA_MAX_JSON_BYTES = 6 * 1024 * 1024;
    private static final String QA_ASSET_HOST = "appassets.androidplatform.net";
    private static final int ACELYNN_RECOVERY_MAX_JSON_BYTES = 6 * 1024 * 1024;
    private static final String ACELYNN_DIRECT_PACKAGE = "com.cactusbyte.acelynnpro";
    private static final String ACELYNN_PRODUCTION_HOST = "acelynn.vercel.app";
    private static final String ACELYNN_RECOVERY_PATH = "/__cactusbyte_recovery__/";
    private static final String ACELYNN_RECOVERY_URL = "https://" + ACELYNN_PRODUCTION_HOST + ACELYNN_RECOVERY_PATH + "index.html";
    private static final String ACELYNN_RECOVERY_PREFS = "acelynn-cutover-recovery";
    private static final String ACELYNN_RECOVERY_DECISION_KEY = "decision-complete";

    private WebView webView;
    private PermissionRequest pendingWebPermission;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private String pendingGeoOrigin;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;
    private boolean qaMode;
    private WebViewAssetLoader qaAssetLoader;
    private boolean acelynnDirectRecoveryMode;
    private WebViewAssetLoader acelynnRecoveryAssetLoader;
    private boolean acelynnRecoveryBridgeActive;
    private boolean acelynnRecoveryPromptVisible;

    @Override
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(5, 8, 7));
        getWindow().setNavigationBarColor(Color.rgb(5, 8, 7));

        qaMode = "qa".equals(BuildConfig.CHANNEL);
        acelynnDirectRecoveryMode = !qaMode
                && "direct".equals(BuildConfig.CHANNEL)
                && ACELYNN_DIRECT_PACKAGE.equals(getPackageName());
        webView = new WebView(this);
        if (qaMode) {
            setUpQaContentView();
            qaAssetLoader = new WebViewAssetLoader.Builder()
                    .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                    .build();
            webView.addJavascriptInterface(new QaDownloadBridge(), "CactusQaBridge");
        } else {
            setContentView(webView);
        }
        if (acelynnDirectRecoveryMode) {
            acelynnRecoveryAssetLoader = new WebViewAssetLoader.Builder()
                    .setDomain(ACELYNN_PRODUCTION_HOST)
                    .addPathHandler(ACELYNN_RECOVERY_PATH, new WebViewAssetLoader.AssetsPathHandler(this))
                    .build();
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    this::handleBackNavigation);
        }

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setGeolocationEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setSupportMultipleWindows(false);
        webView.getSettings().setUserAgentString(webView.getSettings().getUserAgentString() + " CactusByteNative/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (acelynnDirectRecoveryMode && acelynnRecoveryAssetLoader != null) {
                    WebResourceResponse local = acelynnRecoveryAssetLoader.shouldInterceptRequest(request.getUrl());
                    if (local != null) return local;
                }
                if (qaMode && qaAssetLoader != null) {
                    WebResourceResponse local = qaAssetLoader.shouldInterceptRequest(request.getUrl());
                    if (local != null) return local;
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                if (acelynnDirectRecoveryMode && !isAcelynnRecoveryUrl(url)) {
                    disableAcelynnRecoveryBridge();
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (qaMode) {
                    String scheme = uri.getScheme();
                    String host = uri.getHost();
                    if ("https".equalsIgnoreCase(scheme) && QA_ASSET_HOST.equalsIgnoreCase(host)) return false;
                    if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                        return openExternalHttp(uri);
                    }
                }
                return openExternalSchemeIfNeeded(uri);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (qaMode && url != null && url.startsWith("https://" + QA_ASSET_HOST + "/")) {
                    installQaDownloadBridge();
                }
                if (acelynnDirectRecoveryMode && isAcelynnRecoveryUrl(url)) {
                    installAcelynnRecoveryHooks();
                }
            }

            @Override
            public void onSafeBrowsingHit(WebView view, WebResourceRequest request, int threatType, SafeBrowsingResponse callback) {
                callback.backToSafety(true);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleWebPermission(request));
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (hasLocationPermission()) {
                    callback.invoke(origin, true, false);
                    return;
                }
                pendingGeoOrigin = origin;
                pendingGeoCallback = callback;
                ActivityCompat.requestPermissions(MainActivity.this,
                        new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                        REQUEST_GEO_PERMISSION);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> uploadMsg, FileChooserParams fileChooserParams) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = uploadMsg;
                return launchFileChooser(fileChooserParams);
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            if (qaMode && url != null && url.startsWith("blob:")) {
                Toast.makeText(MainActivity.this, "QA export bridge could not capture this download.", Toast.LENGTH_SHORT).show();
                return;
            }
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (ActivityNotFoundException ex) {
                Toast.makeText(MainActivity.this, "No app can open this download.", Toast.LENGTH_SHORT).show();
            }
        });

        if (savedInstanceState == null) {
            if (shouldOfferAcelynnPreLaunchRecovery()) showAcelynnPreLaunchRecoveryPrompt();
            else webView.loadUrl(BuildConfig.START_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }


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

    private void setUpQaContentView() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(5, 8, 7));

        TextView banner = new TextView(this);
        banner.setText("Acelynn Pro — Recovery QA Build · pinned 6363059183ce");
        banner.setTextColor(Color.rgb(20, 15, 0));
        banner.setBackgroundColor(Color.rgb(255, 213, 79));
        banner.setGravity(Gravity.CENTER);
        banner.setTextSize(13f);
        int horizontal = Math.round(12 * getResources().getDisplayMetrics().density);
        int vertical = Math.round(9 * getResources().getDisplayMetrics().density);
        banner.setPadding(horizontal, vertical, horizontal, vertical);

        root.addView(banner, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        root.addView(webView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f));
        setContentView(root);
    }

    private boolean openExternalHttp(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            Toast.makeText(this, "No app is available for this link.", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private boolean openExternalSchemeIfNeeded(Uri uri) {
        String scheme = uri.getScheme();
        if (scheme == null || scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https")) return false;
        try {
            Intent intent = new Intent(scheme.equalsIgnoreCase("tel") ? Intent.ACTION_DIAL : Intent.ACTION_VIEW, uri);
            startActivity(intent);
        } catch (ActivityNotFoundException ignored) {
            Toast.makeText(this, "No app is available for this link.", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private void installQaDownloadBridge() {
        String script = "(function(){" +
                "if(window.__cactusQaDownloadBridgeInstalled)return;" +
                "var nativeClick=HTMLAnchorElement.prototype.click;" +
                "HTMLAnchorElement.prototype.click=function(){var a=this;" +
                "if(a.download&&typeof a.href==='string'&&a.href.indexOf('blob:')===0&&window.CactusQaBridge){" +
                "fetch(a.href).then(function(r){return r.text();}).then(function(t){window.CactusQaBridge.saveJson(a.download,t);}).catch(function(){nativeClick.call(a);});return;}" +
                "return nativeClick.call(a);};" +
                "window.__cactusQaDownloadBridgeInstalled=true;" +
                "})();";
        webView.evaluateJavascript(script, null);
    }

    private final class QaDownloadBridge {
        @JavascriptInterface
        public void saveJson(String requestedName, String json) {
            if (!qaMode || json == null) return;
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            if (bytes.length == 0 || bytes.length > QA_MAX_JSON_BYTES) {
                postToast("QA backup was not saved: invalid file size.");
                return;
            }
            String safeName = sanitizeQaFileName(requestedName);
            try {
                String location = writeQaJson(safeName, bytes);
                postToast("Saved " + safeName + " to " + location);
            } catch (IOException | SecurityException ex) {
                postToast("QA backup could not be saved.");
            }
        }
    }

    private String sanitizeQaFileName(String requestedName) {
        String name = requestedName == null ? "acelynn-pro-backup.json" : requestedName;
        name = name.replaceAll("[^A-Za-z0-9._-]", "_").replace("..", "_");
        if (name.length() > 80) name = name.substring(0, 80);
        if (!name.toLowerCase().endsWith(".json")) name += ".json";
        return name;
    }

    private String writeQaJson(String fileName, byte[] bytes) throws IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
            values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/AcelynnProQA");
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
            return "Downloads/AcelynnProQA";
        }

        File root = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (root == null) throw new IOException("External files directory unavailable");
        File dir = new File(root, "AcelynnProQA");
        if (!dir.exists() && !dir.mkdirs()) throw new IOException("Could not create QA download directory");
        File target = new File(dir, fileName);
        try (OutputStream output = new FileOutputStream(target, false)) {
            output.write(bytes);
            output.flush();
        }
        return target.getAbsolutePath();
    }

    private void postToast(String message) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show());
    }

    private void handleWebPermission(PermissionRequest request) {
        if (acelynnDirectRecoveryMode) {
            if (!isAllowedAcelynnPermissionOrigin(request.getOrigin()) || !requestsOnlyAcelynnAudio(request)) {
                request.deny();
                return;
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                return;
            }
            pendingWebPermission = request;
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_WEB_PERMISSIONS);
            return;
        }
        List<String> needed = new ArrayList<>();
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource) &&
                    ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.CAMERA);
            }
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource) &&
                    ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.RECORD_AUDIO);
            }
        }
        if (needed.isEmpty()) {
            request.grant(request.getResources());
            return;
        }
        pendingWebPermission = request;
        ActivityCompat.requestPermissions(this, needed.toArray(new String[0]), REQUEST_WEB_PERMISSIONS);
    }

    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean launchFileChooser(WebChromeClient.FileChooserParams params) {
        Intent contentIntent;
        try {
            contentIntent = params.createIntent();
        } catch (Exception ex) {
            contentIntent = new Intent(Intent.ACTION_GET_CONTENT).setType("*/*");
        }
        List<Intent> initial = new ArrayList<>();
        Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (cameraIntent.resolveActivity(getPackageManager()) != null) {
            try {
                File cameraDir = new File(getCacheDir(), "camera");
                if (!cameraDir.exists()) cameraDir.mkdirs();
                File photo = File.createTempFile("capture-", ".jpg", cameraDir);
                cameraUri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", photo);
                cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                cameraIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                initial.add(cameraIntent);
            } catch (IOException ignored) {
                cameraUri = null;
            }
        }
        Intent chooser = new Intent(Intent.ACTION_CHOOSER);
        chooser.putExtra(Intent.EXTRA_INTENT, contentIntent);
        chooser.putExtra(Intent.EXTRA_TITLE, "Choose file");
        chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, initial.toArray(new Intent[0]));
        try {
            startActivityForResult(chooser, REQUEST_FILE_CHOOSER);
            return true;
        } catch (ActivityNotFoundException ex) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = null;
            return false;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_FILE_CHOOSER || fileCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getClipData() != null) {
                ClipData clip = data.getClipData();
                result = new Uri[clip.getItemCount()];
                for (int i = 0; i < clip.getItemCount(); i++) result[i] = clip.getItemAt(i).getUri();
            } else if (data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
            } else if (cameraUri != null) {
                result = new Uri[]{cameraUri};
            }
        }
        fileCallback.onReceiveValue(result);
        fileCallback = null;
        cameraUri = null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        boolean granted = true;
        for (int value : grantResults) granted &= value == PackageManager.PERMISSION_GRANTED;
        if (requestCode == REQUEST_WEB_PERMISSIONS && pendingWebPermission != null) {
            if (acelynnDirectRecoveryMode) {
                if (granted && isAllowedAcelynnPermissionOrigin(pendingWebPermission.getOrigin())
                        && requestsOnlyAcelynnAudio(pendingWebPermission)) {
                    pendingWebPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                } else {
                    pendingWebPermission.deny();
                }
            } else if (granted) pendingWebPermission.grant(pendingWebPermission.getResources());
            else pendingWebPermission.deny();
            pendingWebPermission = null;
        }
        if (requestCode == REQUEST_GEO_PERMISSION && pendingGeoCallback != null) {
            pendingGeoCallback.invoke(pendingGeoOrigin, granted || hasLocationPermission(), false);
            pendingGeoCallback = null;
            pendingGeoOrigin = null;
        }
    }

    private void handleBackNavigation() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finish();
    }

    @Override
    public void onBackPressed() {
        handleBackNavigation();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }
}
