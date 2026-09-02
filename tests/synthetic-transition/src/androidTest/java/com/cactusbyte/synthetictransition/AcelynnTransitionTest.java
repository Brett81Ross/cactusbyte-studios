package com.cactusbyte.synthetictransition;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import android.content.Context;
import android.os.SystemClock;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.StaleObjectException;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;
import androidx.test.uiautomator.Until;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.util.List;

@RunWith(AndroidJUnit4.class)
public class AcelynnTransitionTest {
    private static final String ACELYNN_PACKAGE = "com.cactusbyte.acelynnpro";
    private static final String ACELYNN_ACTIVITY = "com.cactusbyte.wrapper.MainActivity";
    private static final String FIXTURE_NAME = "check.wav";
    private static final String LEGACY_BACKUP_NAME = "acelynn-session-report.json";
    private static final String GOOGLE_DOCUMENTS_UI = "com.google.android.documentsui";
    private static final String AOSP_DOCUMENTS_UI = "com.android.documentsui";
    private static final String CHROME_PACKAGE = "com.android.chrome";
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
        device.waitForIdle();

        completeLegacyExternalBackupDownload();
        SystemClock.sleep(2_500);
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

    private void completeLegacyExternalBackupDownload() {
        long deadline = SystemClock.uptimeMillis() + PAGE_TIMEOUT_MS;
        while (SystemClock.uptimeMillis() < deadline) {
            if (findTextOrContains("No app can open this download.") != null) {
                captureDiagnostics("legacy-bridge-no-handler");
                fail("LEGACY_BRIDGE_FAILURE: legacy Export still produced an unopenable download instead of the HTTPS migration handoff");
                return;
            }

            if (dismissChromeNotificationsPromptIfPresent()) {
                device.waitForIdle();
                SystemClock.sleep(350);
                continue;
            }

            if (findTextOrContains("Download Acelynn backup") != null) {
                clickFreshText("Download Acelynn backup", UI_TIMEOUT_MS);
                device.waitForIdle();
                return;
            }

            if (clickOptionalText("Chrome") ||
                    clickOptionalText("Just once") ||
                    clickOptionalText("Only this time") ||
                    clickOptionalText("Accept & continue") ||
                    clickOptionalText("Use without an account") ||
                    clickOptionalText("Continue without an account") ||
                    clickOptionalText("No thanks") ||
                    clickOptionalText("Got it")) {
                device.waitForIdle();
                SystemClock.sleep(350);
                continue;
            }

            SystemClock.sleep(250);
        }

        captureDiagnostics("legacy-browser-handoff-timeout");
        fail("LEGACY_BROWSER_FAILURE: HTTPS migration handoff did not reach the external Acelynn backup page");
    }

    private boolean dismissChromeNotificationsPromptIfPresent() {
        UiObject2 prompt = device.findObject(By.text("Chrome notifications make things easier"));
        if (prompt == null) prompt = device.findObject(By.textContains("Chrome notifications"));
        UiObject2 dismiss = device.findObject(By.res(CHROME_PACKAGE + ":id/negative_button"));
        if (prompt == null && dismiss == null) return false;

        for (int attempt = 0; attempt < 3; attempt++) {
            UiObject2 fresh = device.findObject(By.res(CHROME_PACKAGE + ":id/negative_button"));
            if (fresh == null) fresh = device.findObject(By.text("No thanks"));
            if (fresh == null) return false;
            try {
                fresh.click();
                return true;
            } catch (StaleObjectException ignored) {
                device.waitForIdle();
                SystemClock.sleep(150);
            }
        }

        captureDiagnostics("chrome-notifications-prompt-stuck");
        return false;
    }

    private boolean clickOptionalText(String text) {
        UiObject2 object = findTextOrContains(text);
        if (object == null) return false;
        try {
            object.click();
            return true;
        } catch (StaleObjectException ignored) {
            return false;
        }
    }

    private void clickFreshText(String text, long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 object = findTextOrContains(text);
            if (object != null) {
                try {
                    object.click();
                    return;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }
            SystemClock.sleep(200);
        }
        fail("Could not click fresh UI text: " + text);
    }

    private void chooseDocument(String fileName) {
        SystemClock.sleep(900);

        // Audio fixtures are reliably indexed in MediaStore Audio even when Android 16's
        // Downloads root is empty. Navigate to the real Audio root first instead of depending on
        // Recent/Downloads provider state. Backup JSON continues to use Downloads/search.
        if (isAudioFile(fileName) && waitForDocumentCandidate(fileName, 1_000) == null) {
            openNamedRoot("Audio");
        }

        if (waitForDocumentCandidate(fileName, 2_500) == null) {
            searchDocumentsUi(fileName);
        }

        if (waitForDocumentCandidate(fileName, 1_000) == null && !isAudioFile(fileName)) {
            openNamedRoot("Downloads");
        }

        if (!clickFreshDocumentCandidate(fileName, UI_TIMEOUT_MS)) {
            captureDiagnostics("documentsui-missing-real-file-" + safeName(fileName));
            fail("HARNESS_FAILURE: Android document picker could not click a real file row for " + fileName);
            return;
        }

        device.waitForIdle();
        waitForDocumentPickerToClose(fileName);
    }

    private boolean isAudioFile(String fileName) {
        String lower = fileName == null ? "" : fileName.toLowerCase();
        return lower.endsWith(".wav") || lower.endsWith(".mp3") || lower.endsWith(".m4a") || lower.endsWith(".aac");
    }

    private boolean openNamedRoot(String rootName) {
        leaveDocumentsSearchIfNeeded();

        boolean openedRoots = false;
        for (int attempt = 0; attempt < 3 && !openedRoots; attempt++) {
            UiObject2 roots = device.findObject(By.descContains("Show roots"));
            if (roots == null) roots = device.findObject(By.descContains("Navigate up"));
            if (roots == null) break;
            try {
                roots.click();
                openedRoots = true;
            } catch (StaleObjectException ignored) {
                device.waitForIdle();
                SystemClock.sleep(200);
            }
        }

        if (!openedRoots) {
            device.click(Math.max(56, device.getDisplayWidth() / 20), Math.max(145, device.getDisplayHeight() / 16));
        }
        device.waitForIdle();

        long deadline = SystemClock.uptimeMillis() + 5_000;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 root = device.findObject(By.text(rootName));
            if (root == null) root = device.findObject(By.textContains(rootName));
            if (root != null) {
                try {
                    root.click();
                    device.waitForIdle();
                    return true;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }
            SystemClock.sleep(200);
        }

        captureDiagnostics("documentsui-root-missing-" + safeName(rootName));
        return false;
    }

    private void leaveDocumentsSearchIfNeeded() {
        UiObject2 searchInput = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/search_src_text"));
        if (searchInput == null) searchInput = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/search_src_text"));
        if (searchInput != null) {
            device.pressBack();
            device.waitForIdle();
        }
    }

    private UiObject2 searchDocumentsUi(String fileName) {
        UiObject2 search = device.wait(Until.findObject(By.desc("Search")), 4_000);
        if (search == null) search = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/option_menu_search"));
        if (search == null) search = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/option_menu_search"));
        if (search == null) return null;

        try {
            search.click();
        } catch (StaleObjectException stale) {
            UiObject2 freshSearch = device.findObject(By.desc("Search"));
            if (freshSearch == null) freshSearch = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/option_menu_search"));
            if (freshSearch == null) freshSearch = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/option_menu_search"));
            if (freshSearch == null) return null;
            freshSearch.click();
        }
        device.waitForIdle();

        UiObject2 input = device.wait(Until.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/search_src_text")), 4_000);
        if (input == null) input = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/search_src_text"));
        if (input == null) input = device.findObject(By.clazz("android.widget.AutoCompleteTextView"));
        if (input == null) input = device.findObject(By.clazz("android.widget.EditText"));
        if (input == null) {
            captureDiagnostics("documentsui-search-input-missing");
            device.pressBack();
            device.waitForIdle();
            return null;
        }

        try {
            input.setText(fileName);
        } catch (StaleObjectException stale) {
            UiObject2 freshInput = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/search_src_text"));
            if (freshInput == null) freshInput = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/search_src_text"));
            if (freshInput == null) freshInput = device.findObject(By.clazz("android.widget.AutoCompleteTextView"));
            if (freshInput == null) return null;
            freshInput.setText(fileName);
        }
        SystemClock.sleep(500);
        device.pressEnter();
        device.waitForIdle();

        UiObject2 result = waitForDocumentCandidate(fileName, UI_TIMEOUT_MS);
        if (result != null) return result;

        device.pressBack();
        device.waitForIdle();
        return null;
    }

    private UiObject2 findDocumentCandidate(String fileName) {
        List<UiObject2> exact = device.findObjects(By.text(fileName));
        for (UiObject2 candidate : exact) {
            try {
                if (isRealDocumentCandidate(candidate)) return candidate;
            } catch (StaleObjectException ignored) {
            }
        }

        List<UiObject2> contains = device.findObjects(By.textContains(fileName));
        for (UiObject2 candidate : contains) {
            try {
                if (isRealDocumentCandidate(candidate)) return candidate;
            } catch (StaleObjectException ignored) {
            }
        }
        return null;
    }

    private UiObject2 waitForDocumentCandidate(String fileName, long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 candidate = findDocumentCandidate(fileName);
            if (candidate != null) return candidate;
            SystemClock.sleep(250);
        }
        return null;
    }

    private boolean clickFreshDocumentCandidate(String fileName, long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 candidate = findDocumentCandidate(fileName);
            if (candidate != null) {
                try {
                    candidate.click();
                    return true;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }
            SystemClock.sleep(200);
        }
        return false;
    }

    private boolean isRealDocumentCandidate(UiObject2 candidate) {
        if (candidate == null) return false;
        String resource = candidate.getResourceName();
        String clazz = candidate.getClassName();

        if (resource != null && (
                resource.endsWith(":id/search_src_text") ||
                resource.endsWith(":id/option_menu_search") ||
                resource.endsWith(":id/search_view") ||
                resource.endsWith(":id/toolbar"))) {
            return false;
        }

        return !"android.widget.AutoCompleteTextView".equals(clazz) &&
                !"android.widget.EditText".equals(clazz);
    }

    private void waitForDocumentPickerToClose(String fileName) {
        long deadline = SystemClock.uptimeMillis() + UI_TIMEOUT_MS;
        while (SystemClock.uptimeMillis() < deadline) {
            if (ACELYNN_PACKAGE.equals(device.getCurrentPackageName())) return;
            SystemClock.sleep(250);
        }

        captureDiagnostics("documentsui-did-not-close-" + safeName(fileName));
        fail("HARNESS_FAILURE: selected " + fileName + " but Android document picker did not return to Acelynn");
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
        try {
            object.click();
        } catch (StaleObjectException stale) {
            clickFreshText(text, timeoutMs);
        }
        device.waitForIdle();
    }

    private void clickTextWithScroll(String text, long timeoutMs) {
        UiObject2 object = scrollToText(text, timeoutMs);
        try {
            object.click();
        } catch (StaleObjectException stale) {
            clickFreshText(text, timeoutMs);
        }
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
            try {
                if (object.isEnabled()) return;
            } catch (StaleObjectException stale) {
                fail("HARNESS_FAILURE: UI element became stale while waiting to enable");
            }
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
        }
    }

    private String safeName(String value) {
        return value.toLowerCase().replaceAll("[^a-z0-9._-]+", "-");
    }
}
