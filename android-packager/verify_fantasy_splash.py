from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
APP = ROOT / "app"
GRADLE = (APP / "build.gradle.kts").read_text(encoding="utf-8")
MAIN = (APP / "src/main/java/com/cactusbyte/wrapper/MainActivity.java").read_text(encoding="utf-8")

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

print("Fantasy native splash contract: OK")
