package com.cactusbyte.synthetictransition;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import android.content.Context;
import android.os.SystemClock;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;
import androidx.test.uiautomator.Until;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;

@RunWith(AndroidJUnit4.class)
public class AcelynnTransitionTest {
    private static final String ACELYNN_PACKAGE = "com.cactusbyte.acelynnpro";
    private static final String ACELYNN_ACTIVITY = "com.cactusbyte.wrapper.MainActivity";
    private static final String FIXTURE_NAME = "check.wav";
    private static final String LEGACY_BACKUP_NAME = "acelynn-session-report.json";
    private static final long PAGE_TIMEOUT_MS = 25_000;
    private static final long UI_TIMEOUT_MS = 12_000;

    private UiDevice device;
    private Context targetContext;
    private String currentTest = "unknown";
    private boolean passed;

    @Before
    public void setUp() throws Exception {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        targetContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        passed = false;
        device.pressHome();
        device.waitForIdle();
        device.executeShellCommand("settings put global window_animation_scale 0");
        device.executeShellCommand("settings put global transition_animation_scale 0");
        device.executeShellCommand("settings put global animator_duration_scale 0");
    }

    @After
    public void tearDown() {
        captureDiagnostics(currentTest + (passed ? "-pass" : "-fail"));
    }

    @Test
    public void testLegacyExport() throws Exception {
        currentTest = "legacy-export";
        launchAcelynn();
        assertTextVisible("Acelynn Pro", PAGE_TIMEOUT_MS);

        clickText("Audio file", UI_TIMEOUT_MS);
        clickText("Choose an audio file", UI_TIMEOUT_MS);
        chooseDocument(FIXTURE_NAME);
        assertTextVisible(FIXTURE_NAME, UI_TIMEOUT_MS);

        UiObject2 save = scrollToText("Save current check", UI_TIMEOUT_MS);
        waitUntilEnabled(save, UI_TIMEOUT_MS);
        save.click();
        assertTextVisibleWithScroll("1 saved", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Balanced mix", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Mids leading", UI_TIMEOUT_MS);

        UiObject2 export = scrollToText("Export session report", UI_TIMEOUT_MS);
        waitUntilEnabled(export, UI_TIMEOUT_MS);
        export.click();
        SystemClock.sleep(2_500);

        // File existence and JSON integrity are intentionally verified by adb in the workflow.
        // If the legacy blob: URL cannot escape WebView, the workflow must stop RED rather than
        // manufacturing a backup inside this harness.
        passed = true;
    }

    @Test
    public void testPermanentRestore() throws Exception {
        currentTest = "permanent-restore";
        launchAcelynn();

        assertTextVisible("Restore Acelynn Pro backup?", PAGE_TIMEOUT_MS);
        clickText("Restore backup", UI_TIMEOUT_MS);

        assertTextVisible("Restore / merge backup", PAGE_TIMEOUT_MS);
        clickTextWithScroll("Restore / merge backup", UI_TIMEOUT_MS);
        chooseDocument(LEGACY_BACKUP_NAME);

        assertTextVisibleWithScroll("Backup restored", PAGE_TIMEOUT_MS);
        assertTextVisibleWithScroll("Recovery complete.", UI_TIMEOUT_MS);
        clickText("Continue to Acelynn Pro", UI_TIMEOUT_MS);

        assertTextVisible("Acelynn Pro", PAGE_TIMEOUT_MS);
        assertTextVisibleWithScroll("Session snapshots", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("1 saved", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Balanced mix", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Mids leading", UI_TIMEOUT_MS);

        scrollToTop();
        clickText("Audio file", UI_TIMEOUT_MS);
        clickText("Choose an audio file", UI_TIMEOUT_MS);
        chooseDocument(FIXTURE_NAME);
        assertTextVisible(FIXTURE_NAME, UI_TIMEOUT_MS);

        UiObject2 save = scrollToText("Save current check", UI_TIMEOUT_MS);
        waitUntilEnabled(save, UI_TIMEOUT_MS);
        save.click();
        assertTextVisibleWithScroll("2 saved", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Balanced mix", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Mids leading", UI_TIMEOUT_MS);
        passed = true;
    }

    private void launchAcelynn() throws Exception {
        device.executeShellCommand("am force-stop " + ACELYNN_PACKAGE);
        String result = device.executeShellCommand(
                "am start -W -n " + ACELYNN_PACKAGE + "/" + ACELYNN_ACTIVITY);
        assertTrue("Acelynn launch command failed: " + result,
                result.contains("Status: ok") || result.contains("cmp=" + ACELYNN_PACKAGE));
        device.waitForIdle();
    }

    private void chooseDocument(String fileName) {
        SystemClock.sleep(900);

        // Android 16 DocumentsUI can leave Recent empty even though the fixture is present and
        // indexed. Prefer exact filename search, then fall back to the Downloads filesystem root.
        UiObject2 file = waitForTextOrContains(fileName, 2_000);
        if (file == null) {
            file = searchDocumentsUi(fileName);
        }

        if (file == null) {
            openDownloadsRoot();
            file = waitForTextOrContains(fileName, UI_TIMEOUT_MS);
        }

        if (file == null) {
            captureDiagnostics("documentsui-missing-" + safeName(fileName));
            fail("HARNESS_FAILURE: Android document picker could not find indexed file " + fileName);
            return;
        }

        file.click();
        device.waitForIdle();
    }

    private UiObject2 searchDocumentsUi(String fileName) {
        UiObject2 search = device.wait(Until.findObject(By.desc("Search")), 4_000);
        if (search == null) {
            search = device.findObject(By.res("com.google.android.documentsui:id/option_menu_search"));
        }
        if (search == null) {
            search = device.findObject(By.res("com.android.documentsui:id/option_menu_search"));
        }
        if (search == null) return null;

        search.click();
        device.waitForIdle();

        // Google DocumentsUI on Android 16 exposes its query box as AutoCompleteTextView, not
        // EditText. Prefer the stable resource id, with class fallbacks for AOSP variants.
        UiObject2 input = device.wait(
                Until.findObject(By.res("com.google.android.documentsui:id/search_src_text")), 4_000);
        if (input == null) {
            input = device.findObject(By.res("com.android.documentsui:id/search_src_text"));
        }
        if (input == null) {
            input = device.findObject(By.clazz("android.widget.AutoCompleteTextView"));
        }
        if (input == null) {
            input = device.findObject(By.clazz("android.widget.EditText"));
        }
        if (input == null) {
            captureDiagnostics("documentsui-search-input-missing");
            device.pressBack();
            device.waitForIdle();
            return null;
        }

        input.setText(fileName);
        SystemClock.sleep(500);
        device.pressEnter();
        device.waitForIdle();

        UiObject2 result = waitForTextOrContains(fileName, UI_TIMEOUT_MS);
        if (result != null) return result;

        // Back out of search before trying the roots drawer fallback.
        device.pressBack();
        device.waitForIdle();
        return null;
    }

    private void openDownloadsRoot() {
        UiObject2 roots = device.findObject(By.descContains("Show roots"));
        if (roots == null) roots = device.findObject(By.descContains("Navigate up"));

        if (roots != null) {
            roots.click();
            device.waitForIdle();
        } else {
            // Last-resort fallback for the standard Android 16 hamburger position after semantic
            // selectors fail. This remains harness-only and is backed by captured API 36 evidence.
            device.click(Math.max(56, device.getDisplayWidth() / 20), Math.max(145, device.getDisplayHeight() / 16));
            device.waitForIdle();
        }

        UiObject2 downloads = device.wait(Until.findObject(By.text("Downloads")), 5_000);
        if (downloads == null) downloads = device.findObject(By.textContains("Download"));
        if (downloads != null) {
            downloads.click();
            device.waitForIdle();
        }
    }

    private UiObject2 findTextOrContains(String text) {
        UiObject2 exact = device.findObject(By.text(text));
        return exact != null ? exact : device.findObject(By.textContains(text));
    }

    private UiObject2 waitForTextOrContains(String text, long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 object = findTextOrContains(text);
            if (object != null) return object;
            SystemClock.sleep(250);
        }
        return null;
    }

    private void clickText(String text, long timeoutMs) {
        UiObject2 object = waitForTextOrContains(text, timeoutMs);
        assertNotNull("Could not find UI text: " + text, object);
        object.click();
        device.waitForIdle();
    }

    private void clickTextWithScroll(String text, long timeoutMs) {
        UiObject2 object = scrollToText(text, timeoutMs);
        object.click();
        device.waitForIdle();
    }

    private void assertTextVisible(String text, long timeoutMs) {
        UiObject2 object = waitForTextOrContains(text, timeoutMs);
        assertNotNull("Expected UI text was not visible: " + text, object);
    }

    private void assertTextVisibleWithScroll(String text, long timeoutMs) {
        scrollToText(text, timeoutMs);
    }

    private UiObject2 scrollToText(String text, long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 object = findTextOrContains(text);
            if (object != null) return object;
            swipeUp();
            SystemClock.sleep(300);
        }
        captureDiagnostics("missing-" + safeName(text));
        fail("Could not find UI text after scrolling: " + text);
        return null;
    }

    private void waitUntilEnabled(UiObject2 object, long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            if (object.isEnabled()) return;
            SystemClock.sleep(250);
        }
        fail("UI element never became enabled: " + object.getText());
    }

    private void swipeUp() {
        int width = device.getDisplayWidth();
        int height = device.getDisplayHeight();
        device.swipe(width / 2, (int) (height * 0.78), width / 2, (int) (height * 0.30), 24);
    }

    private void scrollToTop() {
        int width = device.getDisplayWidth();
        int height = device.getDisplayHeight();
        for (int i = 0; i < 7; i++) {
            device.swipe(width / 2, (int) (height * 0.30), width / 2, (int) (height * 0.80), 24);
            SystemClock.sleep(120);
        }
    }

    private void captureDiagnostics(String label) {
        try {
            File root = new File(targetContext.getExternalFilesDir(null), "diagnostics");
            if (!root.exists() && !root.mkdirs()) return;
            String safe = safeName(label);
            device.takeScreenshot(new File(root, safe + ".png"));
            device.dumpWindowHierarchy(new File(root, safe + ".xml"));
        } catch (Exception ignored) {
            // Diagnostics must never hide the original assertion failure.
        }
    }

    private String safeName(String value) {
        return value.toLowerCase().replaceAll("[^a-z0-9._-]+", "-");
    }
}
