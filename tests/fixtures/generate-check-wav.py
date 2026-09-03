#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import math
import struct
import sys
import wave
from pathlib import Path

SAMPLE_RATE = 16_000
# Keep the deterministic fixture playing long enough for the API 36 document picker,
# analysis startup, and UiAutomator scroll to reach the snapshot control before EOF.
DURATION_SECONDS = 90
FREQUENCY_HZ = 440.0
AMPLITUDE = 0.35


def build_samples() -> bytes:
    frames = bytearray()
    total = SAMPLE_RATE * DURATION_SECONDS
    peak = int(32767 * AMPLITUDE)
    for i in range(total):
        value = int(round(peak * math.sin(2.0 * math.pi * FREQUENCY_HZ * i / SAMPLE_RATE)))
        frames.extend(struct.pack('<h', value))
    return bytes(frames)


def main() -> None:
    output = Path(sys.argv[1] if len(sys.argv) > 1 else 'tests/fixtures/check.wav')
    output.parent.mkdir(parents=True, exist_ok=True)
    samples = build_samples()
    with wave.open(str(output), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(samples)
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    print(f'{output} sha256={digest} bytes={output.stat().st_size}')


if __name__ == '__main__':
    main()
