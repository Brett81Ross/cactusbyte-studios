package com.cactusbyte.synthetictransition;

import static org.junit.Assert.fail;

import android.os.SystemClock;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.StaleObjectException;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;

import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class ChromeFirstRunSetupTest {
    private static final String CHROME_PACKAGE = "com.android.chrome";
    private static final String BACKUP_PAGE_TEXT = "Download Acelynn backup";
    private static final String BACKUP_URL_FRAGMENT = "acelynn.vercel.app/legacy-backup";
    private static final long TIMEOUT_MS = 30_000;

    @Test
    public void dismissChromeFirstRunIfPresent() throws Exception {
        UiDevice device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());

        device.executeShellCommand(
                "am start -W -a android.intent.action.VIEW -d https://acelynn.vercel.app/legacy-backup com.android.chrome");
        device.waitForIdle();

        long deadline = SystemClock.uptimeMillis() + TIMEOUT_MS;
        while (SystemClock.uptimeMillis() < deadline) {
            // Success is not merely "Chrome is foreground." Chrome can briefly report itself
            // foreground before its first-run pages have actually inflated. Require proof that
            // the requested migration page is reachable before declaring the precondition green.
            if (isBackupPageReady(device)) {
                device.pressHome();
                device.waitForIdle();
                return;
            }

            UiObject2 dismiss = findFirstRunDismiss(device);
            if (dismiss != null) {
                try {
                    clickNodeOrClickableAncestor(dismiss);
                    device.waitForIdle();
                    SystemClock.sleep(700);
                    continue;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }

            // Chrome can show a notification opt-in after the account/sign-in page.
            UiObject2 notificationsDismiss = device.findObject(
                    By.res(CHROME_PACKAGE + ":id/negative_button"));
            if (notificationsDismiss == null) {
                notificationsDismiss = device.findObject(By.text("No thanks"));
            }
            if (notificationsDismiss != null) {
                try {
                    clickNodeOrClickableAncestor(notificationsDismiss);
                    device.waitForIdle();
                    SystemClock.sleep(700);
                    continue;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }

            SystemClock.sleep(250);
        }

        String currentPackage = device.getCurrentPackageName();
        UiObject2 title = device.findObject(By.res(CHROME_PACKAGE + ":id/title"));
        String visibleTitle = title == null ? "<none>" : String.valueOf(title.getText());
        fail("HARNESS_FAILURE: Chrome did not reach the Acelynn backup page after first-run handling" +
                " (foreground=" + currentPackage + ", chromeTitle=" + visibleTitle + ")");
    }

    private boolean isBackupPageReady(UiDevice device) {
        if (!CHROME_PACKAGE.equals(device.getCurrentPackageName())) return false;

        UiObject2 pageText = device.findObject(By.text(BACKUP_PAGE_TEXT));
        if (pageText == null) pageText = device.findObject(By.textContains(BACKUP_PAGE_TEXT));
        if (pageText != null) return true;

        // The omnibox/accessibility text is a secondary readiness signal in case the page's
        // WebView text has not yet entered the accessibility tree.
        UiObject2 url = device.findObject(By.textContains(BACKUP_URL_FRAGMENT));
        if (url != null) return true;

        UiObject2 urlBar = device.findObject(By.res(CHROME_PACKAGE + ":id/url_bar"));
        if (urlBar != null) {
            String text = urlBar.getText();
            return text != null && text.contains(BACKUP_URL_FRAGMENT);
        }
        return false;
    }

    private UiObject2 findFirstRunDismiss(UiDevice device) {
        // Stable ids first; text fallbacks cover Chrome variants.
        UiObject2 dismiss = device.findObject(
                By.res(CHROME_PACKAGE + ":id/signin_fre_dismiss_button"));
        if (dismiss == null) dismiss = device.findObject(By.text("Use without an account"));
        if (dismiss == null) dismiss = device.findObject(By.text("Continue without an account"));
        if (dismiss == null) dismiss = device.findObject(By.text("No thanks"));
        if (dismiss == null) dismiss = device.findObject(By.text("Not now"));
        if (dismiss == null) dismiss = device.findObject(By.text("Got it"));
        return dismiss;
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
}
