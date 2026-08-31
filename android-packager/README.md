# CactusByte Android APK Packager

This project builds real Android APK packages for the CactusByte Studios launchpad and every app currently in the CactusByte ecosystem. Each flavor has its own Android application ID, app label, production URL, and launcher icon sourced from the app's live brand asset.

The native shell uses Android WebView so the deployed web app remains the source of truth while users get a real installed Android application instead of a browser shortcut. Camera, microphone, geolocation, file picking/camera capture, cookies, and non-web deep links are supported.

APK release assets are published under the stable GitHub release tag `android-latest`.
