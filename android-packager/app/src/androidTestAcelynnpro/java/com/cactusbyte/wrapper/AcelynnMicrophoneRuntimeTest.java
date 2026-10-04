package com.cactusbyte.wrapper;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.ParcelFileDescriptor;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.json.JSONTokener;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class AcelynnMicrophoneRuntimeTest {
    private WebView findWebView(View view) {
        if (view instanceof WebView) return (WebView) view;
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                WebView found = findWebView(group.getChildAt(i));
                if (found != null) return found;
            }
        }
        return null;
    }

    private String evaluate(WebView web, String script) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> value = new AtomicReference<>();
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() ->
            web.evaluateJavascript(script, result -> { value.set(result); done.countDown(); }));
        assertTrue("WebView evaluation timed out", done.await(10, TimeUnit.SECONDS));
        Object decoded = new JSONTokener(value.get()).nextValue();
        return String.valueOf(decoded);
    }

    @Test public void microphoneDeliversBuffersThenStopsAndRestarts() throws Exception {
        android.app.Instrumentation instrumentation = InstrumentationRegistry.getInstrumentation();
        String pkg = instrumentation.getTargetContext().getPackageName();
        assertEquals("com.cactusbyte.acelynnpro", pkg);
        assertEquals("Chromium audio routing permission missing", PackageManager.PERMISSION_GRANTED,
            instrumentation.getTargetContext().checkSelfPermission(Manifest.permission.MODIFY_AUDIO_SETTINGS));
        try (ParcelFileDescriptor ignored = instrumentation.getUiAutomation()
                .executeShellCommand("pm grant " + pkg + " android.permission.RECORD_AUDIO")) {
            // Wait for PackageManager to observe the grant before activity launch.
        }
        long deadline = System.currentTimeMillis() + 10000;
        while (instrumentation.getTargetContext().checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED && System.currentTimeMillis() < deadline) Thread.sleep(100);
        assertEquals(PackageManager.PERMISSION_GRANTED,
            instrumentation.getTargetContext().checkSelfPermission(Manifest.permission.RECORD_AUDIO));
        Intent intent = new Intent(instrumentation.getTargetContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Activity activity = instrumentation.startActivitySync(intent);
        AtomicReference<WebView> found = new AtomicReference<>();
        instrumentation.runOnMainSync(() -> found.set(findWebView(activity.getWindow().getDecorView())));
        WebView web = found.get();
        assertNotNull(web);
        try {
            deadline = System.currentTimeMillis() + 60000;
            String ready = "";
            do {
                ready = evaluate(web, "location.origin === 'https://acelynn.vercel.app' && document.readyState === 'complete' && isSecureContext && !!navigator.mediaDevices");
                if ("true".equals(ready)) break;
                Thread.sleep(250);
            } while (System.currentTimeMillis() < deadline);
            assertEquals("Production HTTPS WebView did not become ready", "true", ready);
            String script = "(function(){window.__acelynnMicRuntimeGate='running';"
                + "(async function(){for(var attempt=0;attempt<2;attempt++){"
                + "var stream=null,ctx=null;try{"
                + "stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});"
                + "var tracks=stream.getAudioTracks();"
                + "if(tracks.length!==1||tracks[0].readyState!=='live')throw Error('No live audio track');"
                + "ctx=new AudioContext();await ctx.resume();"
                + "var source=ctx.createMediaStreamSource(stream),processor=ctx.createScriptProcessor(2048,1,1),mute=ctx.createGain();"
                + "mute.gain.value=0;source.connect(processor);processor.connect(mute);mute.connect(ctx.destination);"
                + "await new Promise(function(resolve,reject){var buffers=0,timer=setTimeout(function(){reject(Error('No microphone audio buffers'));},10000);"
                + "processor.onaudioprocess=function(e){if(e.inputBuffer.length>0&&++buffers>=3){clearTimeout(timer);resolve();}};});"
                + "processor.disconnect();source.disconnect();mute.disconnect();"
                + "}finally{if(stream)stream.getTracks().forEach(function(t){t.stop();});if(ctx)await ctx.close();}"
                + "if(stream.getAudioTracks()[0].readyState!=='ended')throw Error('Microphone failed to stop');"
                + "}window.__acelynnMicRuntimeGate='PASS';})().catch(function(e){window.__acelynnMicRuntimeGate='FAIL '+e.name+': '+e.message;});return 'started';})();";
            assertEquals("started", evaluate(web, script));
            deadline = System.currentTimeMillis() + 40000;
            String result;
            do {
                result = evaluate(web, "window.__acelynnMicRuntimeGate");
                if (!"running".equals(result)) break;
                Thread.sleep(200);
            } while (System.currentTimeMillis() < deadline);
            assertEquals("Android getUserMedia -> WebChromeClient -> live track -> audio buffers -> stop/restart: " + result,
                "PASS", result);
        } finally {
            instrumentation.runOnMainSync(activity::finish);
        }
    }
}
