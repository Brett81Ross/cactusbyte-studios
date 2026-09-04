package com.cactusbyte.synthetictransition;

import android.os.SystemClock;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Four-snapshot migration proof built on the hardened single-snapshot harness.
 * Picker, retry, hierarchy fallback, browser handoff, and diagnostics behavior are
 * deliberately reused from AcelynnTransitionTest instead of creating a second selector stack.
 */
@RunWith(AndroidJUnit4.class)
public class AcelynnMultiSnapshotTest {
    private static final long PAGE_TIMEOUT_MS = 25_000;
    private static final long UI_TIMEOUT_MS = 12_000;
    private static final String LEGACY_BACKUP_NAME = "acelynn-session-report.json";

    private static final String[] FILES = {
            "01-sub.wav",
            "02-bass.wav",
            "03-mids.wav",
            "04-presence.wav"
    };

    private static final String[] EXPECTED_FOCUS = {
            "Sub",
            "Bass",
            "Mids",
            "Presence"
    };

    private AcelynnTransitionTest helper;
    private UiDevice device;

    @Before
    public void setUp() throws Exception {
        helper = new AcelynnTransitionTest();
        helper.setUp();
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    }

    @Test
    public void testLegacyMultiSnapshotExport() throws Exception {
        launchAcelynn();
        assertTextVisible("Acelynn Pro", PAGE_TIMEOUT_MS);
        clickText("Audio file", UI_TIMEOUT_MS);

        for (int i = 0; i < FILES.length; i++) {
            if (i > 0) scrollToTop();
            clickText("Choose an audio file", UI_TIMEOUT_MS);
            chooseDocument(FILES[i]);
            assertTextVisible(FILES[i], UI_TIMEOUT_MS);

            SystemClock.sleep(1_500);
            clickReliableControl(
                    "multi-save-" + (i + 1), "captureButton", UI_TIMEOUT_MS, true,
                    "Save current check", "Save last check");
            assertTextVisibleWithScroll((i + 1) + " saved", UI_TIMEOUT_MS);
            assertTextVisibleWithScroll(EXPECTED_FOCUS[i] + " leading", UI_TIMEOUT_MS);
        }

        clickReliableControl(
                "multi-export", "exportButton", UI_TIMEOUT_MS, true,
                "Export session report");
        device.waitForIdle();
        completeLegacyExternalBackupDownload();
        SystemClock.sleep(2_500);
    }

    @Test
    public void testPermanentMultiSnapshotRestore() throws Exception {
        launchAcelynn();

        assertTextVisible("Restore Acelynn Pro backup?", PAGE_TIMEOUT_MS);
        clickReliableControl(
                "multi-native-restore-confirm", "android:id/button1", UI_TIMEOUT_MS, false,
                "RESTORE BACKUP", "Restore backup");

        clickReliableControl(
                "multi-recovery-restore", "restoreButton", PAGE_TIMEOUT_MS, true,
                "Restore / merge backup");
        device.waitForIdle();
        chooseDocument(LEGACY_BACKUP_NAME);

        assertTextVisibleWithScroll("Backup restored", PAGE_TIMEOUT_MS);
        assertTextVisibleWithScroll("Recovery complete.", UI_TIMEOUT_MS);

        clickReliableControl(
                "multi-recovery-continue", "cactusbyte-recovery-continue", UI_TIMEOUT_MS, true,
                "Continue to Acelynn Pro");
        device.waitForIdle();

        assertTextVisible("Acelynn Pro", PAGE_TIMEOUT_MS);
        assertTextVisibleWithScroll("Session snapshots", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("4 saved", UI_TIMEOUT_MS);
        for (String focus : EXPECTED_FOCUS) {
            assertTextVisibleWithScroll(focus + " leading", UI_TIMEOUT_MS);
        }

        // Restored data must remain writable, not merely readable.
        scrollToTop();
        clickText("Audio file", UI_TIMEOUT_MS);
        clickText("Choose an audio file", UI_TIMEOUT_MS);
        chooseDocument(FILES[2]);
        assertTextVisible(FILES[2], UI_TIMEOUT_MS);
        SystemClock.sleep(1_500);
        clickReliableControl(
                "multi-post-restore-save", "captureButton", UI_TIMEOUT_MS, true,
                "Save current check", "Save last check");
        assertTextVisibleWithScroll("5 saved", UI_TIMEOUT_MS);
        assertTextVisibleWithScroll("Mids leading", UI_TIMEOUT_MS);
    }

    private Object invoke(String methodName, Class<?>[] parameterTypes, Object... args) throws Exception {
        Method method = AcelynnTransitionTest.class.getDeclaredMethod(methodName, parameterTypes);
        method.setAccessible(true);
        try {
            return method.invoke(helper, args);
        } catch (InvocationTargetException wrapped) {
            Throwable cause = wrapped.getCause();
            if (cause instanceof AssertionError) throw (AssertionError) cause;
            if (cause instanceof Exception) throw (Exception) cause;
            throw new RuntimeException(cause);
        }
    }

    private void launchAcelynn() throws Exception {
        invoke("launchAcelynn", new Class<?>[]{});
    }

    private void chooseDocument(String fileName) throws Exception {
        invoke("chooseDocument", new Class<?>[]{String.class}, fileName);
    }

    private void completeLegacyExternalBackupDownload() throws Exception {
        invoke("completeLegacyExternalBackupDownload", new Class<?>[]{});
    }

    private void scrollToTop() throws Exception {
        invoke("scrollToTop", new Class<?>[]{});
    }

    private void clickText(String text, long timeoutMs) throws Exception {
        invoke("clickText", new Class<?>[]{String.class, long.class}, text, timeoutMs);
    }

    private void assertTextVisible(String text, long timeoutMs) throws Exception {
        invoke("assertTextVisible", new Class<?>[]{String.class, long.class}, text, timeoutMs);
    }

    private void assertTextVisibleWithScroll(String text, long timeoutMs) throws Exception {
        invoke("assertTextVisibleWithScroll", new Class<?>[]{String.class, long.class}, text, timeoutMs);
    }

    private void clickReliableControl(
            String label,
            String resourceId,
            long timeoutMs,
            boolean allowScroll,
            String... texts) throws Exception {
        invoke(
                "clickReliableControl",
                new Class<?>[]{String.class, String.class, long.class, boolean.class, String[].class},
                label, resourceId, timeoutMs, allowScroll, texts);
    }
}
