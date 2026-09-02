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
    private static final long TIMEOUT_MS = 20_000;

    @Test
    public void dismissChromeFirstRunIfPresent() throws Exception {
        UiDevice device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());

        device.executeShellCommand(
                "am start -W -a android.intent.action.VIEW -d https://acelynn.vercel.app/legacy-backup com.android.chrome");
        device.waitForIdle();

        long deadline = SystemClock.uptimeMillis() + TIMEOUT_MS;
        while (SystemClock.uptimeMillis() < deadline) {
            // Prefer Chrome's stable resource id so generic text such as
            // 'Make Chrome your own' can never starve the real dismiss button.
            UiObject2 dismiss = device.findObject(By.res(CHROME_PACKAGE + ":id/signin_fre_dismiss_button"));
            if (dismiss == null) dismiss = device.findObject(By.text("Use without an account"));
            if (dismiss == null) dismiss = device.findObject(By.text("Continue without an account"));
            if (dismiss == null) dismiss = device.findObject(By.text("No thanks"));
            if (dismiss == null) dismiss = device.findObject(By.text("Not now"));
            if (dismiss == null) dismiss = device.findObject(By.text("Got it"));

            if (dismiss != null) {
                try {
                    dismiss.click();
                    device.waitForIdle();
                    SystemClock.sleep(500);
                    continue;
                } catch (StaleObjectException ignored) {
                    device.waitForIdle();
                }
            }

            boolean firstRunStillVisible =
                    device.findObject(By.res(CHROME_PACKAGE + ":id/signin_fre_dismiss_button")) != null ||
                    device.findObject(By.textContains("Make Chrome your own")) != null;
            if (CHROME_PACKAGE.equals(device.getCurrentPackageName()) && !firstRunStillVisible) {
                device.pressHome();
                device.waitForIdle();
                return;
            }

            SystemClock.sleep(250);
        }

        fail("HARNESS_FAILURE: Chrome first-run screen could not be dismissed deterministically");
    }
}
