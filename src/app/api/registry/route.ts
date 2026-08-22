import { NextResponse } from "next/server";
import { studioApps } from "../../../data/apps";

export const revalidate = 300;

type SyncRecord = {
  id: string;
  version: string;
  status: "Live" | "Repository";
  synced: boolean;
};

function extractVersion(source: string): string | null {
  const applicationVersion = source.match(
    /<meta[^>]*name=["']application-version["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  if (applicationVersion?.[1]) {
    const value = applicationVersion[1].trim();
    return value.startsWith("v") ? value : `v${value}`;
  }

  const versionFirst = source.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']application-version["'][^>]*>/i,
  );
  if (versionFirst?.[1]) {
    const value = versionFirst[1].trim();
    return value.startsWith("v") ? value : `v${value}`;
  }

  const visibleVersion = source.match(/\bv(\d+\.\d+\.\d+)\b/i);
  if (visibleVersion?.[1]) return `v${visibleVersion[1]}`;

  const jsonVersion = source.match(/["']version["']\s*:\s*["'](\d+\.\d+\.\d+)["']/i);
  if (jsonVersion?.[1]) return `v${jsonVersion[1]}`;

  return null;
}

async function syncApp(app: (typeof studioApps)[number]): Promise<SyncRecord> {
  if (!app.syncSource) {
    return { id: app.id, version: app.version, status: app.status, synced: false };
  }

  try {
    const response = await fetch(app.syncSource, {
      headers: { "user-agent": "CactusByte-App-Registry/1.0" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      return { id: app.id, version: app.version, status: app.status, synced: false };
    }

    const source = await response.text();
    return {
      id: app.id,
      version: extractVersion(source) ?? app.version,
      status: app.status,
      synced: true,
    };
  } catch {
    return { id: app.id, version: app.version, status: app.status, synced: false };
  }
}

export async function GET() {
  const apps = await Promise.all(studioApps.map(syncApp));
  return NextResponse.json(
    { apps, syncedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
