package com.cactusbyte.wrapper;

import android.Manifest;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

/**
 * Isolated Acelynn Pro renderer-QA launcher.
 *
 * Keeps the shared production MainActivity untouched while restoring the strict local-asset
 * microphone permission bridge already proven by the Acelynn physical QA path.
 */
public final class RenderQaMainActivity extends MainActivity {
    private static final int REQUEST_RENDER_QA_AUDIO = 7101;
    private static final String QA_ASSET_HOST = "appassets.androidplatform.net";

    private WebView qaWebView;
    private PermissionRequest pendingQaAudioRequest;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        qaWebView = findWebView(getWindow().getDecorView());
        if (qaWebView == null) {
            Toast.makeText(this, "Acelynn Render QA WebView was not found.", Toast.LENGTH_LONG).show();
            return;
        }

        qaWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleQaPermissionRequest(request));
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingQaAudioRequest == request) pendingQaAudioRequest = null;
            }
        });
    }

    private void handleQaPermissionRequest(PermissionRequest request) {
        if (!isAllowedQaOrigin(request.getOrigin()) || !requestsAudioCapture(request)) {
            request.deny();
            Toast.makeText(this, "Blocked an unexpected Render QA WebView permission request.", Toast.LENGTH_LONG).show();
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
                REQUEST_RENDER_QA_AUDIO);
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

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQUEST_RENDER_QA_AUDIO || pendingQaAudioRequest == null) return;

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
        for (int index = 0; index < group.getChildCount(); index += 1) {
            WebView found = findWebView(group.getChildAt(index));
            if (found != null) return found;
        }
        return null;
    }
}
