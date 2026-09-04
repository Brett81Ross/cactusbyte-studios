package com.cactusbyte.synthetictransition;

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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    private static final int CLICK_ATTEMPTS = 3;
    private static final long CLICK_RETRY_DELAY_MS = 500;
    private static final Pattern NODE_PATTERN = Pattern.compile("<node\\b[^>]*>");
    private static final Pattern BOUNDS_PATTERN = Pattern.compile("\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]");

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

        // WebView DOM ids are stable even when API 36 intermittently refuses By.text queries.
        // The generic click utility retries resource/text selectors, captures diagnostics on
        // every miss, and can fall back to the bounds from UiAutomator's own hierarchy dump.
        clickReliableControl(
                "legacy-save", "captureButton", UI_TIMEOUT_MS, true,
                "Save current check", "Save last check");
        assertTextVisibleWithScroll("1 saved", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Balanced mix", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Mids leading", UI_TIMEOUT_MS);

        clickReliableControl(
                "legacy-export", "exportButton", UI_TIMEOUT_MS, true,
                "Export session report");
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
        clickReliableControl(
                "native-restore-confirm", "android:id/button1", UI_TIMEOUT_MS, false,
                "RESTORE BACKUP", "Restore backup");

        clickReliableControl(
                "recovery-restore", "restoreButton", PAGE_TIMEOUT_MS, true,
                "Restore / merge backup");
        device.waitForIdle();
        chooseDocument(LEGACY_BACKUP_NAME);

        assertTextVisibleWithScroll("Backup restored", PAGE_TIMEOUT_MS);
        assertTextVisibleWithScroll("Recovery complete.", UI_TIMEOUT_MS);

        clickReliableControl(
                "recovery-continue", "cactusbyte-recovery-continue", UI_TIMEOUT_MS, true,
                "Continue to Acelynn Pro");
        device.waitForIdle();

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

        clickReliableControl(
                "post-restore-save", "captureButton", UI_TIMEOUT_MS, true,
                "Save current check", "Save last check");
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
                clickReliableControl(
                        "browser-download-backup", null, UI_TIMEOUT_MS, false,
                        "Download Acelynn backup");
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

        for (int attempt = 1; attempt <= CLICK_ATTEMPTS; attempt++) {
            UiObject2 fresh = device.findObject(By.res(CHROME_PACKAGE + ":id/negative_button"));
            if (fresh == null) fresh = device.findObject(By.text("No thanks"));
            if (fresh == null) return false;
            try {
                clickNodeOrClickableAncestor(fresh);
                return true;
            } catch (StaleObjectException ignored) {
                captureDiagnostics("chrome-notifications-attempt-" + attempt);
                device.waitForIdle();
                SystemClock.sleep(CLICK_RETRY_DELAY_MS);
            }
        }

        captureDiagnostics("chrome-notifications-prompt-stuck");
        return false;
    }

    private boolean clickOptionalText(String text) {
        UiObject2 object = findTextOrContains(text);
        if (object == null) return false;
        try {
            clickNodeOrClickableAncestor(object);
            return true;
        } catch (StaleObjectException ignored) {
            return false;
        }
    }

    private void chooseDocument(String fileName) {
        waitForDocumentsUi(fileName);

        UiObject2 candidate = waitForDocumentCandidate(fileName, 1_000);
        if (candidate == null) {
            openNamedRoot("Downloads");
            candidate = waitForDocumentCandidate(fileName, 5_000);
        }

        if (candidate == null) {
            candidate = searchDocumentsUi(fileName);
        }

        if (candidate == null || !clickFreshDocumentCandidate(fileName, UI_TIMEOUT_MS)) {
            logPickerState("missing-document", fileName);
            captureDiagnostics("documentsui-missing-real-file-" + safeName(fileName));
            fail("HARNESS_FAILURE: Android document picker could not click a real file row for " + fileName +
                    " (foreground=" + device.getCurrentPackageName() + ")");
            return;
        }

        device.waitForIdle();
        waitForDocumentPickerToClose(fileName);
    }

    private void waitForDocumentsUi(String fileName) {
        long deadline = SystemClock.uptimeMillis() + 7_000;
        while (SystemClock.uptimeMillis() < deadline) {
            String pkg = device.getCurrentPackageName();
            if (GOOGLE_DOCUMENTS_UI.equals(pkg) || AOSP_DOCUMENTS_UI.equals(pkg)) {
                System.out.println("DocumentsUI foreground for " + fileName + ": " + pkg);
                device.waitForIdle();
                return;
            }
            SystemClock.sleep(200);
        }

        logPickerState("picker-not-foreground", fileName);
        captureDiagnostics("documentsui-not-foreground-" + safeName(fileName));
        fail("HARNESS_FAILURE: Android document picker never reached foreground for " + fileName +
                " (foreground=" + device.getCurrentPackageName() + ")");
    }

    private boolean openNamedRoot(String rootName) {
        leaveDocumentsSearchIfNeeded();

        boolean openedRoots = false;
        for (int attempt = 0; attempt < CLICK_ATTEMPTS && !openedRoots; attempt++) {
            UiObject2 roots = device.findObject(By.descContains("Show roots"));
            if (roots == null) roots = device.findObject(By.descContains("Navigate up"));
            if (roots == null) break;
            try {
                clickNodeOrClickableAncestor(roots);
                openedRoots = true;
            } catch (StaleObjectException ignored) {
                device.waitForIdle();
                SystemClock.sleep(200);
            }
        }

        if (!openedRoots) {
            device.click(Math.max(56, device.getDisplayWidth() / 20),
                    Math.max(145, device.getDisplayHeight() / 16));
        }
        device.waitForIdle();
        SystemClock.sleep(250);

        long deadline = SystemClock.uptimeMillis() + 5_000;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 root = device.findObject(By.text(rootName));
            if (root == null) root = device.findObject(By.textContains(rootName));
            if (root != null) {
                try {
                    clickNodeOrClickableAncestor(root);
                    device.waitForIdle();
                    SystemClock.sleep(350);
                    System.out.println("DocumentsUI root selected: " + rootName +
                            " foreground=" + device.getCurrentPackageName());
                    return true;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }
            SystemClock.sleep(200);
        }

        logPickerState("root-missing", rootName);
        captureDiagnostics("documentsui-root-missing-" + safeName(rootName));
        return false;
    }

    private void leaveDocumentsSearchIfNeeded() {
        UiObject2 searchInput = findDocumentsSearchInput();
        if (searchInput != null) {
            device.pressBack();
            device.waitForIdle();
            SystemClock.sleep(250);
        }
    }

    private UiObject2 searchDocumentsUi(String fileName) {
        UiObject2 search = device.wait(Until.findObject(By.desc("Search")), 4_000);
        if (search == null) search = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/option_menu_search"));
        if (search == null) search = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/option_menu_search"));
        if (search == null) {
            logPickerState("search-button-missing", fileName);
            return null;
        }

        try {
            clickNodeOrClickableAncestor(search);
        } catch (StaleObjectException stale) {
            UiObject2 freshSearch = device.findObject(By.desc("Search"));
            if (freshSearch == null) freshSearch = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/option_menu_search"));
            if (freshSearch == null) freshSearch = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/option_menu_search"));
            if (freshSearch == null) return null;
            clickNodeOrClickableAncestor(freshSearch);
        }
        device.waitForIdle();
        SystemClock.sleep(400);

        UiObject2 input = waitForDocumentsSearchInput(5_000);
        if (input == null) {
            logPickerState("search-input-missing", fileName);
            captureDiagnostics("documentsui-search-input-missing");
            return null;
        }

        try {
            input.setText(fileName);
        } catch (StaleObjectException stale) {
            UiObject2 freshInput = waitForDocumentsSearchInput(2_000);
            if (freshInput == null) return null;
            freshInput.setText(fileName);
        }
        SystemClock.sleep(500);
        device.pressEnter();
        device.waitForIdle();

        UiObject2 result = waitForDocumentCandidate(fileName, UI_TIMEOUT_MS);
        if (result != null) return result;

        leaveDocumentsSearchIfNeeded();
        return null;
    }

    private UiObject2 findDocumentsSearchInput() {
        UiObject2 input = device.findObject(By.res(GOOGLE_DOCUMENTS_UI + ":id/search_src_text"));
        if (input == null) input = device.findObject(By.res(AOSP_DOCUMENTS_UI + ":id/search_src_text"));
        if (input == null) input = device.findObject(By.res("android:id/search_src_text"));
        if (input == null) input = device.findObject(By.clazz("android.widget.AutoCompleteTextView"));
        if (input == null) input = device.findObject(By.clazz("android.widget.EditText"));
        return input;
    }

    private UiObject2 waitForDocumentsSearchInput(long timeoutMs) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 input = findDocumentsSearchInput();
            if (input != null) return input;
            SystemClock.sleep(200);
        }
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
                    clickNodeOrClickableAncestor(candidate);
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
        String pkg = candidate.getApplicationPackage();

        if (pkg != null && !GOOGLE_DOCUMENTS_UI.equals(pkg) && !AOSP_DOCUMENTS_UI.equals(pkg)) {
            return false;
        }
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

        logPickerState("picker-did-not-close", fileName);
        captureDiagnostics("documentsui-did-not-close-" + safeName(fileName));
        fail("HARNESS_FAILURE: selected " + fileName +
                " but Android document picker did not return to Acelynn");
    }

    private void logPickerState(String stage, String value) {
        System.out.println("PICKER_DIAGNOSTIC stage=" + stage +
                " value=" + value +
                " foreground=" + device.getCurrentPackageName());
    }

    private UiObject2 findTextOrContains(String text) {
        UiObject2 exact = device.findObject(By.text(text));
        return exact != null ? exact : device.findObject(By.textContains(text));
    }

    private UiObject2 findControl(String resourceId, String... texts) {
        UiObject2 object = null;
        if (resourceId != null && !resourceId.isEmpty()) {
            object = device.findObject(By.res(resourceId));
            if (object == null && !resourceId.contains(":")) {
                object = device.findObject(By.res(ACELYNN_PACKAGE + ":id/" + resourceId));
            }
        }
        if (object != null) return object;

        for (String text : texts) {
            object = findTextOrContains(text);
            if (object != null) return object;
        }
        return null;
    }

    private void clickReliableControl(
            String label,
            String resourceId,
            long timeoutMs,
            boolean allowScroll,
            String... texts) {
        // The initial viewport is not a retry. Probe it first, then probe every viewport
        // produced by each of the three retry scrolls before we are allowed to fail.
        // This avoids the previous off-by-one bug where retry #3 scrolled the target into
        // view and the method exited without ever querying/clicking that new viewport.
        int maxViewport = allowScroll ? CLICK_ATTEMPTS : 0;
        long perViewportMs = Math.max(1_500, timeoutMs / Math.max(1, maxViewport + 1));

        for (int viewport = 0; viewport <= maxViewport; viewport++) {
            if (viewport > 0) {
                swipeUp();
                device.waitForIdle();
                SystemClock.sleep(CLICK_RETRY_DELAY_MS);
            }

            if (tryClickCurrentViewport(
                    label, viewport, resourceId, perViewportMs, texts)) {
                return;
            }
        }

        captureDiagnostics("reliable-" + safeName(label) + "-final");
        fail("HARNESS_FAILURE: Could not click " + label +
                " after probing initial viewport plus " + maxViewport + " retry viewport(s)" +
                " (foreground=" + device.getCurrentPackageName() + ")");
    }

    private boolean tryClickCurrentViewport(
            String label,
            int viewport,
            String resourceId,
            long timeoutMs,
            String... texts) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        while (SystemClock.uptimeMillis() < deadline) {
            UiObject2 object = findControl(resourceId, texts);
            if (object != null) {
                try {
                    if (!object.isEnabled()) {
                        SystemClock.sleep(200);
                        continue;
                    }
                    clickNodeOrClickableAncestor(object);
                    device.waitForIdle();
                    System.out.println("Reliable click succeeded: " + label +
                            " viewport=" + viewport);
                    return true;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }
            SystemClock.sleep(200);
        }

        String viewportLabel = "reliable-" + safeName(label) + "-viewport-" + viewport;
        captureDiagnostics(viewportLabel);
        System.out.println("RELIABLE_CLICK_MISS label=" + label +
                " viewport=" + viewport +
                " foreground=" + device.getCurrentPackageName());

        if (clickFromCapturedHierarchy(viewportLabel, resourceId, texts)) {
            device.waitForIdle();
            System.out.println("Hierarchy fallback click succeeded: " + label +
                    " viewport=" + viewport);
            return true;
        }
        return false;
    }

    private boolean clickFromCapturedHierarchy(String diagnosticLabel, String resourceId, String... texts) {
        try {
            File xml = new File(diagnosticsRoot(), safeName(diagnosticLabel) + ".xml");
            if (!xml.exists()) {
                device.dumpWindowHierarchy(xml);
            }
            String hierarchy = readFile(xml);
            Matcher nodes = NODE_PATTERN.matcher(hierarchy);
            while (nodes.find()) {
                String node = nodes.group();
                String nodeResource = attribute(node, "resource-id");
                String nodeText = attribute(node, "text");
                String enabled = attribute(node, "enabled");
                String visible = attribute(node, "visible-to-user");

                boolean resourceMatch = matchesResource(nodeResource, resourceId);
                boolean textMatch = matchesAnyText(nodeText, texts);
                if (!resourceMatch && !textMatch) continue;
                if ("false".equals(enabled) || "false".equals(visible)) continue;

                String bounds = attribute(node, "bounds");
                Matcher boundsMatcher = BOUNDS_PATTERN.matcher(bounds);
                if (!boundsMatcher.matches()) continue;

                int left = Integer.parseInt(boundsMatcher.group(1));
                int top = Integer.parseInt(boundsMatcher.group(2));
                int right = Integer.parseInt(boundsMatcher.group(3));
                int bottom = Integer.parseInt(boundsMatcher.group(4));
                if (right <= left || bottom <= top) continue;

                device.click((left + right) / 2, (top + bottom) / 2);
                return true;
            }
        } catch (Exception error) {
            System.out.println("Hierarchy fallback error for " + diagnosticLabel + ": " + error);
        }
        return false;
    }

    private boolean matchesResource(String actual, String expected) {
        if (expected == null || expected.isEmpty() || actual == null || actual.isEmpty()) return false;
        return actual.equals(expected) ||
                actual.equals(ACELYNN_PACKAGE + ":id/" + expected) ||
                actual.endsWith(":id/" + expected);
    }

    private boolean matchesAnyText(String actual, String... expectedTexts) {
        if (actual == null || actual.isEmpty()) return false;
        for (String expected : expectedTexts) {
            if (expected != null && !expected.isEmpty() && actual.contains(expected)) return true;
        }
        return false;
    }

    private String attribute(String node, String name) {
        Pattern pattern = Pattern.compile(Pattern.quote(name) + "=\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(node);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String readFile(File file) throws Exception {
        StringBuilder out = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                out.append(line).append('\n');
            }
        }
        return out.toString();
    }

    private void clickText(String text, long timeoutMs) {
        clickReliableControl("text-" + text, null, timeoutMs, false, text);
    }

    private void assertTextVisible(String text, long timeoutMs) {
        if (waitForTextEvidence(text, timeoutMs, false)) return;
        captureDiagnostics("missing-" + safeName(text));
        fail("Expected UI text was not visible: " + text);
    }

    private void assertTextVisibleWithScroll(String text, long timeoutMs) {
        if (waitForTextEvidence(text, timeoutMs, true)) return;
        captureDiagnostics("missing-" + safeName(text));
        fail("Could not find UI text after scrolling: " + text);
    }

    private boolean waitForTextEvidence(String text, long timeoutMs, boolean allowScroll) {
        long deadline = SystemClock.uptimeMillis() + timeoutMs;
        int scrolls = 0;
        while (SystemClock.uptimeMillis() < deadline) {
            if (findTextOrContains(text) != null) return true;
            if (hierarchyContainsText(text)) return true;

            if (allowScroll && scrolls < 7) {
                swipeUp();
                scrolls++;
                device.waitForIdle();
            }
            SystemClock.sleep(300);
        }
        return false;
    }

    private boolean hierarchyContainsText(String text) {
        try {
            File xml = new File(diagnosticsRoot(), "probe.xml");
            device.dumpWindowHierarchy(xml);
            return readFile(xml).contains(text);
        } catch (Exception ignored) {
            return false;
        }
    }

    private void clickNodeOrClickableAncestor(UiObject2 object) {
        UiObject2 target = object;
        for (int depth = 0; depth < 5 && target != null; depth++) {
            if (target.isClickable()) {
                target.click();
                return;
            }
            UiObject2 parent = target.getParent();
            if (parent == null) break;
            target = parent;
        }
        object.click();
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

    private File diagnosticsRoot() {
        File root = new File(targetContext.getExternalFilesDir(null), "diagnostics");
        if (!root.exists()) root.mkdirs();
        return root;
    }

    private void captureDiagnostics(String label) {
        try {
            File root = diagnosticsRoot();
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
