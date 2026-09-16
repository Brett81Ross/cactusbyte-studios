from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
APP = ROOT / "app"
REPO = ROOT.parent
GRADLE = (APP / "build.gradle.kts").read_text(encoding="utf-8")
MAIN = (APP / "src/main/java/com/cactusbyte/wrapper/MainActivity.java").read_text(encoding="utf-8")
WORKFLOW = (REPO / ".github/workflows/build-android-apks.yml").read_text(encoding="utf-8")

values = APP / "src/fantasy/res/values/styles.xml"
values31 = APP / "src/fantasy/res/values-v31/styles.xml"
drawable = APP / "src/fantasy/res/drawable/native_splash_transparent.xml"

assert values.is_file(), "Fantasy must own a flavor-specific dark launch theme"
assert values31.is_file(), "Fantasy must override Android 12+ system splash styling"
assert drawable.is_file(), "Fantasy must provide a transparent system-splash drawable"

base = values.read_text(encoding="utf-8")
v31 = values31.read_text(encoding="utf-8")
icon = drawable.read_text(encoding="utf-8")

assert "#040a06" in base, "Fantasy launch background must match branded web splash"
assert "android:windowSplashScreenBackground" in v31 and "#040a06" in v31
assert "android:windowSplashScreenAnimatedIcon" in v31
assert "@drawable/native_splash_transparent" in v31
assert "@android:color/transparent" in icon
assert 'BuildConfig.APPLICATION_ID.equals("com.cactusbyte.fantasyfootballmatrix")' in MAIN
assert "webView.setBackgroundColor(Color.rgb(4, 10, 6))" in MAIN

fantasy = re.search(r'create\("fantasy"\)\s*\{(?P<body>.*?)\n\s*\}', GRADLE, re.S)
assert fantasy, "Fantasy product flavor is missing"
body = fantasy.group("body")
assert "versionCode = 3" in body, "Fantasy APK update must increment versionCode"
assert 'versionName = "1.0.2"' in body, "Fantasy APK update must increment versionName"

# Production signing must never fall back to a runner-generated debug identity.
assert 'FANTASY_RELEASE_SIGNING' in GRADLE, "Gradle must expose a dedicated Fantasy release-signing mode"
assert 'FANTASY_ANDROID_KEYSTORE_PATH' in GRADLE, "Gradle must load the permanent Fantasy keystore by path"
assert 'FANTASY_ANDROID_KEYSTORE_PASSWORD' in GRADLE
assert 'FANTASY_ANDROID_KEY_ALIAS' in GRADLE
assert 'FANTASY_ANDROID_KEY_PASSWORD' in GRADLE
assert 'create("fantasyRelease")' in GRADLE, "Gradle must define a dedicated permanent Fantasy signing config"

for secret in (
    "FANTASY_ANDROID_KEYSTORE_B64",
    "FANTASY_ANDROID_KEYSTORE_PASSWORD",
    "FANTASY_ANDROID_KEY_ALIAS",
    "FANTASY_ANDROID_KEY_PASSWORD",
):
    assert f"secrets.{secret}" in WORKFLOW, f"Workflow must consume protected GitHub secret {secret}"

assert "Require permanent Fantasy signing secrets" in WORKFLOW
assert "Build permanently signed Fantasy APK" in WORKFLOW
assert ":app:assembleFantasyRelease" in WORKFLOW
assert "apksigner" in WORKFLOW and "--print-certs" in WORKFLOW
assert "CDD191E286F8B40C1C03DF7CBFFA7EF13DFD61749ECD48041E52538D59D14D01" in WORKFLOW, "Workflow must pin the permanent public certificate fingerprint"

print("Fantasy native splash + permanent signing contract: OK")
