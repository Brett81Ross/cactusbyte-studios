# Synthetic transition fixture policy

The Acelynn legacy-to-permanent transition harness uses the deterministic `tests/fixtures/generate-check-wav.py` fixture.

For API 36 UiAutomator coverage, the fixture intentionally runs for 90 seconds. This keeps audio analysis active through Android DocumentsUI selection and the scroll to Acelynn's snapshot control, so the legacy test exercises the intended `Save current check` state rather than racing the 20-second fixture EOF.

The fixture remains deterministic and its SHA-256 is emitted into the workflow evidence manifest on every run. This is test-harness timing only; it does not change Acelynn production code, production data, Android signing identities, or cutover authorization.
