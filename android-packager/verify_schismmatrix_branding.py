from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGER = ROOT / "android-packager"
GRADLE = (PACKAGER / "app" / "build.gradle.kts").read_text(encoding="utf-8")
ICONS = (PACKAGER / "fetch_icons.py").read_text(encoding="utf-8")
WORKFLOW = (ROOT / ".github" / "workflows" / "build-android-apks.yml").read_text(encoding="utf-8")
STYLE = PACKAGER / "app" / "src" / "noproblem" / "res" / "values-v31" / "styles.xml"

start = GRADLE.index('create("noproblem")')
end = GRADLE.index('create("machzero")')
block = GRADLE[start:end]

assert 'resValue("string", "app_name", "SchismMatrix")' in block, "noproblem flavor is still branded as No Problem"
assert 'versionCode = 3' in block, "SchismMatrix native flavor versionCode was not advanced"
assert 'versionName = "1.1.0"' in block, "SchismMatrix native flavor versionName is not 1.1.0"

assert '"noproblem": ("https://noproblem-pws.vercel.app/assets/schismmatrix-symbol.svg", "#06131c")' in ICONS, "native SchismMatrix launcher is not sourced from the Schism symbol"
assert 'app-icon-192.webp' not in ICONS.split('"noproblem":', 1)[1].split('"machzero":', 1)[0], "legacy No Problem launcher source remains active"

assert STYLE.is_file(), "Android 12+ SchismMatrix splash style is missing"
style = STYLE.read_text(encoding="utf-8")
assert 'android:windowSplashScreenAnimatedIcon' in style and '@mipmap/ic_launcher' in style, "Android 12+ splash is not using the SchismMatrix launcher"
assert '#06131c' in style, "Android 12+ SchismMatrix splash background is wrong"

assert 'dist/SchismMatrix.apk' in WORKFLOW, "SchismMatrix APK is not collected under its own release name"
assert 'gh release upload android-latest dist/SchismMatrix.apk' in WORKFLOW, "SchismMatrix APK is not published to android-latest"

print("SchismMatrix native branding QA passed")
