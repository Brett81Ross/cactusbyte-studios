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
        UiObject2 file = findTextOrContains(fileName);
        if (file == null) {
            UiObject2 roots = device.findObject(By.descContains("Show roots"));
            if (roots == null) roots = device.findObject(By.descContains("Navigate up"));
            if (roots != null) {
                roots.click();
                device.waitForIdle();
            }
            UiObject2 downloads = device.wait(Until.findObject(By.text("Downloads")), 4_000);
            if (downloads != null) {
                downloads.click();
                device.waitForIdle();
            }
            file = waitForTextOrContains(fileName, UI_TIMEOUT_MS);
        }
        assertNotNull("Document picker could not find " + fileName, file);
        file.click();
        device.waitForIdle();
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
