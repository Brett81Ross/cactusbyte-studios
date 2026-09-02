package com.cactusbyte.wrapper;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Acelynn Pro physical-QA launcher.
 *
 * This activity deliberately leaves the shared production MainActivity untouched. It layers a
 * strict microphone permission bridge, native JSON restore validation, and QA-only diagnostics over
 * the self-contained QA WebView.
 */
public final class QaMainActivity extends MainActivity {
    private static final int REQUEST_QA_AUDIO = 6101;
    private static final int REQUEST_QA_FILE = 6102;
    private static final int QA_MAX_BACKUP_BYTES = 5 * 1024 * 1024;
    private static final String QA_ASSET_HOST = "appassets.androidplatform.net";

    private WebView qaWebView;
    private PermissionRequest pendingQaAudioRequest;
    private ValueCallback<Uri[]> qaFileCallback;
    private TextView qaBackupFeedback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        qaWebView = findWebView(getWindow().getDecorView());
        if (qaWebView == null) {
            Toast.makeText(this, "Acelynn QA WebView was not found.", Toast.LENGTH_LONG).show();
            return;
        }

        installNativeQaBackupFeedbackBar();

        qaWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleQaPermissionRequest(request));
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingQaAudioRequest == request) pendingQaAudioRequest = null;
            }

            @Override
            public boolean onShowFileChooser(WebView webView,
                                             ValueCallback<Uri[]> uploadMsg,
                                             FileChooserParams fileChooserParams) {
                if (qaFileCallback != null) qaFileCallback.onReceiveValue(null);
                qaFileCallback = uploadMsg;
                return launchQaFileChooser();
            }
        });

        installQaMediaDiagnosticsWhenReady(20);
    }

    private void installNativeQaBackupFeedbackBar() {
        if (!(qaWebView.getParent() instanceof LinearLayout)) return;
        LinearLayout parent = (LinearLayout) qaWebView.getParent();
        TextView feedback = new TextView(this);
        feedback.setTextColor(Color.WHITE);
        feedback.setBackgroundColor(Color.rgb(58, 16, 28));
        feedback.setGravity(Gravity.CENTER_VERTICAL);
        feedback.setTextSize(14f);
        int horizontal = Math.round(14 * getResources().getDisplayMetrics().density);
        int vertical = Math.round(11 * getResources().getDisplayMetrics().density);
        feedback.setPadding(horizontal, vertical, horizontal, vertical);
        feedback.setVisibility(View.GONE);
        feedback.setContentDescription("Acelynn Pro QA backup validation result");
        int webViewIndex = parent.indexOfChild(qaWebView);
        parent.addView(feedback, webViewIndex, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        qaBackupFeedback = feedback;
    }

    private void handleQaPermissionRequest(PermissionRequest request) {
        if (!isAllowedQaOrigin(request.getOrigin()) || !requestsAudioCapture(request)) {
            request.deny();
            Toast.makeText(this, "Blocked an unexpected QA WebView permission request.", Toast.LENGTH_LONG).show();
            return;
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            return;
        }

        if (pendingQaAudioRequest != null && pendingQaAudioRequest != request) {
            pendingQaAudioRequest.deny();
        }
        pendingQaAudioRequest = request;
        ActivityCompat.requestPermissions(
                this,
                new String[]{Manifest.permission.RECORD_AUDIO},
                REQUEST_QA_AUDIO);
    }

    private boolean isAllowedQaOrigin(Uri origin) {
        if (origin == null) return false;
        if (!"https".equalsIgnoreCase(origin.getScheme())) return false;
        if (!QA_ASSET_HOST.equalsIgnoreCase(origin.getHost())) return false;
        int port = origin.getPort();
        return port == -1 || port == 443;
    }

    private boolean requestsAudioCapture(PermissionRequest request) {
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) return true;
        }
        return false;
    }

    private boolean launchQaFileChooser() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/json", "text/plain"});
        try {
            startActivityForResult(intent, REQUEST_QA_FILE);
            return true;
        } catch (Exception ex) {
            if (qaFileCallback != null) qaFileCallback.onReceiveValue(null);
            qaFileCallback = null;
            Toast.makeText(this, "No file picker is available for the QA backup.", Toast.LENGTH_LONG).show();
            return false;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_QA_FILE || qaFileCallback == null) return;

        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri uri = data.getData();
            String rejectionReason = validateQaBackupUri(uri);
            if (rejectionReason != null) {
                qaFileCallback.onReceiveValue(null);
                qaFileCallback = null;
                showQaBackupRejected(rejectionReason);
                return;
            }

            hideQaBackupFeedback();
            try {
                getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } catch (SecurityException ignored) {
                // The one-time chooser grant is sufficient when the provider does not support persistence.
            }
            result = new Uri[]{uri};
        }
        qaFileCallback.onReceiveValue(result);
        qaFileCallback = null;
    }

    private String validateQaBackupUri(Uri uri) {
        if (uri == null) return "No backup file was selected.";
        try (InputStream input = getContentResolver().openInputStream(uri)) {
            if (input == null) return "The selected file could not be read.";
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int total = 0;
            int read;
            while ((read = input.read(buffer)) != -1) {
                total += read;
                if (total > QA_MAX_BACKUP_BYTES) return "Backup file is larger than 5 MB.";
                output.write(buffer, 0, read);
            }

            String raw = new String(output.toByteArray(), StandardCharsets.UTF_8);
            JSONObject payload = new JSONObject(raw);
            if (!"Acelynn Pro".equals(payload.optString("app", ""))) {
                return "This backup belongs to a different app.";
            }
            if (payload.has("schema")) {
                if (!"acelynn-pro-backup-v1".equals(payload.optString("schema", ""))) {
                    return "Unsupported Acelynn Pro backup schema.";
                }
                if (payload.optInt("version", Integer.MIN_VALUE) != 1) {
                    return "Unsupported Acelynn Pro backup version.";
                }
            }
            if (payload.has("snapshots") && !(payload.opt("snapshots") instanceof JSONArray)) {
                return "Backup snapshots must be an array.";
            }
            return null;
        } catch (JSONException ex) {
            return "Backup is not valid JSON.";
        } catch (IOException | SecurityException ex) {
            return "The selected file could not be read.";
        }
    }

    private void showQaBackupRejected(String reason) {
        String message = "Backup rejected — " + reason + " Your saved checks were not changed.";
        if (qaBackupFeedback != null) {
            qaBackupFeedback.setText(message);
            qaBackupFeedback.setVisibility(View.VISIBLE);
        }
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private void hideQaBackupFeedback() {
        if (qaBackupFeedback == null) return;
        qaBackupFeedback.setText("");
        qaBackupFeedback.setVisibility(View.GONE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQUEST_QA_AUDIO || pendingQaAudioRequest == null) return;

        boolean granted = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED;
        if (granted && isAllowedQaOrigin(pendingQaAudioRequest.getOrigin())
                && requestsAudioCapture(pendingQaAudioRequest)) {
            pendingQaAudioRequest.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else {
            pendingQaAudioRequest.deny();
        }
        pendingQaAudioRequest = null;
    }

    private WebView findWebView(View view) {
        if (view instanceof WebView) return (WebView) view;
        if (!(view instanceof ViewGroup)) return null;
        ViewGroup group = (ViewGroup) view;
        for (int i = 0; i < group.getChildCount(); i++) {
            WebView found = findWebView(group.getChildAt(i));
            if (found != null) return found;
        }
        return null;
    }

    private void installQaMediaDiagnosticsWhenReady(int attemptsRemaining) {
        if (qaWebView == null || attemptsRemaining <= 0) return;
        qaWebView.evaluateJavascript("document.readyState", state -> {
            if (state != null && (state.contains("complete") || state.contains("interactive"))) {
                installQaMediaDiagnostics();
            } else {
                qaWebView.postDelayed(() -> installQaMediaDiagnosticsWhenReady(attemptsRemaining - 1), 150L);
            }
        });
    }

    private void installQaMediaDiagnostics() {
        String script = "(function(){" +
                "if(window.__cactusQaMicDiagnosticsInstalled)return;" +
                "window.__cactusQaMicDiagnosticsInstalled=true;" +
                "var media=navigator.mediaDevices;" +
                "if(!media||typeof media.getUserMedia!=='function'){" +
                "var t=document.getElementById('coachTitle'),c=document.getElementById('coachText');" +
                "if(t)t.textContent='Android WebView microphone API unavailable';" +
                "if(c)c.textContent='This QA build cannot see navigator.mediaDevices.getUserMedia on this device.';return;}" +
                "var original=media.getUserMedia.bind(media);" +
                "media.getUserMedia=function(constraints){return original(constraints).catch(function(err){" +
                "var name=(err&&err.name)||'UnknownError';var msg=(err&&err.message)||'No error message';" +
                "setTimeout(function(){" +
                "var t=document.getElementById('coachTitle'),c=document.getElementById('coachText');" +
                "if(t)t.textContent='Microphone access failed in Android QA';" +
                "if(c)c.textContent='Android app permission is enabled, but WebView audio capture failed: '+name+' — '+msg;" +
                "},0);throw err;});};" +
                "})();";
        qaWebView.evaluateJavascript(script, null);
    }
}
