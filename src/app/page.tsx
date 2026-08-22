"use client";

import { useEffect, useMemo, useState } from "react";
import { studioApps, type StudioApp } from "../data/apps";

const VERSION = "1.0.2";

type ShareTarget = { name: string; url: string };
type SyncInfo = { version: string; status: "Live" | "Repository"; synced: boolean };

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showRepoOnly, setShowRepoOnly] = useState(true);
  const [compact, setCompact] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installMessage, setInstallMessage] = useState("");
  const [syncInfo, setSyncInfo] = useState<Record<string, SyncInfo>>({});
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cactusbyte-settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setShowRepoOnly(settings.showRepoOnly ?? true);
        setCompact(settings.compact ?? false);
      } catch {}
    }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const handler = (event: Event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    void syncRegistry(false);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  useEffect(() => {
    localStorage.setItem("cactusbyte-settings", JSON.stringify({ showRepoOnly, compact }));
  }, [showRepoOnly, compact]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(studioApps.map((app) => app.category))).sort()], []);
  const visibleApps = useMemo(() => {
    const term = query.trim().toLowerCase();
    return studioApps.filter((app) => {
      const currentStatus = syncInfo[app.id]?.status ?? app.status;
      if (!showRepoOnly && currentStatus === "Repository") return false;
      if (category !== "All" && app.category !== category) return false;
      if (!term) return true;
      return `${app.name} ${app.description} ${app.category}`.toLowerCase().includes(term);
    });
  }, [query, category, showRepoOnly, syncInfo]);
  const liveCount = studioApps.filter((app) => (syncInfo[app.id]?.status ?? app.status) === "Live").length;

  async function syncRegistry(notify = true) {
    setSyncing(true);
    try {
      const response = await fetch("/api/registry", { cache: "no-store" });
      if (!response.ok) throw new Error("Registry sync failed");
      const payload = await response.json();
      const next: Record<string, SyncInfo> = {};
      for (const item of payload.apps ?? []) next[item.id] = { version: item.version, status: item.status, synced: Boolean(item.synced) };
      setSyncInfo(next);
      if (notify) setInstallMessage(`Registry synced. ${Object.values(next).filter((item) => item.synced).length}/${studioApps.length} app sources responded.`);
    } catch {
      if (notify) setInstallMessage("Registry sync could not complete. Saved app data is still available.");
    } finally { setSyncing(false); }
  }

  async function installApp() {
    if (installPrompt?.prompt) { await installPrompt.prompt(); setInstallPrompt(null); return; }
    setInstallMessage("Android: open the browser menu and choose Install app. iPhone/iPad: Share → Add to Home Screen.");
  }

  async function nativeShare(target: ShareTarget) {
    const data = { title: target.name, text: `${target.name} by Cactus🌵Byte Studios™`, url: target.url };
    if (navigator.share) { try { await navigator.share(data); return; } catch {} }
    await navigator.clipboard.writeText(target.url);
    setInstallMessage("Link copied to clipboard.");
  }

  function shareStudio() { setShareTarget({ name: "Cactus🌵Byte Studios™", url: window.location.href }); }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <img src="/logo2.png" alt="Cactus Byte Studios logo" className="brand-logo" />
          <div><p className="eyebrow">APP ECOSYSTEM</p><h1>Cactus<span>🌵</span>Byte Studios™</h1><p className="brand-subtitle">Command Center · v{VERSION}</p></div>
        </div>
        <div className="top-actions">
          <button className="icon-button" onClick={installApp}>Install</button>
          <button className="icon-button" onClick={shareStudio}>Share</button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)}>Settings</button>
        </div>
      </header>

      <section className="hero-panel">
        <div><p className="eyebrow">ONE STUDIO · ONE LAUNCHPAD</p><h2>Your CactusByte apps, organized in one place.</h2><p className="hero-copy">Launch live products, inspect repository-backed projects, share verified links, and sync app identity and version data through the CactusByte App Registry™.</p></div>
        <div className="stat-grid" aria-label="Studio summary"><div className="stat-card"><strong>{studioApps.length}</strong><span>Registered apps</span></div><div className="stat-card"><strong>{liveCount}</strong><span>Launchable now</span></div><div className="stat-card"><strong>1.0</strong><span>Registry foundation</span></div></div>
      </section>

      {installMessage && <div className="notice" role="status"><span>{installMessage}</span><button onClick={() => setInstallMessage("")} aria-label="Dismiss message">×</button></div>}

      <section className="core-strip" aria-label="Proprietary foundation">
        <div><span className="core-dot" /><strong>CactusByte App Registry™</strong><small>Live source sync enabled</small></div>
        <div><span className="core-dot pending" /><strong>CactusByte Core™</strong><small>Architecture reserved</small></div>
        <div><span className="core-dot pending" /><strong>ByteLink™</strong><small>Protocol reserved</small></div>
      </section>

      <section className="catalog-section">
        <div className="section-heading"><div><p className="eyebrow">APP MATRIX</p><h2>Studio Registry</h2></div><div className="section-actions"><span className="result-count">{visibleApps.length} shown</span><button className="secondary-button" onClick={() => void syncRegistry(true)} disabled={syncing}>{syncing ? "Syncing…" : "Sync Registry"}</button></div></div>
        <div className="controls">
          <label className="search-box"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps or categories" inputMode="search" /></label>
          <label className="category-box"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        </div>
        <div className={`app-grid ${compact ? "compact" : ""}`}>{visibleApps.map((app) => <AppCard key={app.id} app={app} sync={syncInfo[app.id]} onShare={setShareTarget} />)}</div>
      </section>

      <section className="foundation-panel"><div><p className="eyebrow">PROPRIETARY FOUNDATION</p><h2>Built to become more than a portfolio.</h2></div><div className="foundation-grid"><article><strong>Registry</strong><p>One authoritative record for app identity, links, platforms, version sync, and release state.</p></article><article><strong>Core</strong><p>Reserved server-side layer for shared authentication, entitlements, updates, AI routing, and secure services.</p></article><article><strong>ByteLink</strong><p>Reserved cross-app handoff standard so compatible CactusByte products can exchange signed payloads later.</p></article></div></section>

      <footer><img src="/logo2.png" alt="" aria-hidden="true" /><p>Cactus🌵Byte Studios™ v{VERSION} · Cactus🌵Byte Studios™ · All Rights Reserved</p></footer>

      {settingsOpen && <Modal title="Settings" onClose={() => setSettingsOpen(false)}><div className="setting-row"><div><strong>Show repository-only apps</strong><span>Include projects without a verified live link.</span></div><input type="checkbox" checked={showRepoOnly} onChange={(e) => setShowRepoOnly(e.target.checked)} /></div><div className="setting-row"><div><strong>Compact app cards</strong><span>Fit more apps on screen.</span></div><input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /></div><div className="settings-meta"><span>App version</span><strong>{VERSION}</strong><span>Registry records</span><strong>{studioApps.length}</strong><span>Platform target</span><strong>Android + iOS friendly</strong></div></Modal>}
      {shareTarget && <Modal title={`Share ${shareTarget.name}`} onClose={() => setShareTarget(null)}><ShareCard target={shareTarget} onShare={nativeShare} /></Modal>}
    </main>
  );
}

function AppCard({ app, sync, onShare }: { app: StudioApp; sync?: SyncInfo; onShare: (target: ShareTarget) => void }) {
  const status = sync?.status ?? app.status;
  const version = sync?.version ?? app.version;
  const ghostLaneMark = app.id === "ghostlane";
  return (
    <article className="app-card">
      <div className="card-topline">
        <div className="app-mark" style={ghostLaneMark ? { width: 56, height: 56, borderRadius: "50%", borderColor: "rgba(109,255,227,.32)" } : undefined}>
          <img src={app.logo} alt={`${app.shortName} logo`} loading="lazy" style={ghostLaneMark ? { width: 54, height: 54, objectFit: "cover", borderRadius: "50%" } : undefined} onError={(event) => { const image = event.currentTarget; image.onerror = null; image.src = "/logo2.png"; }} />
        </div>
        <div className={`status-pill ${status === "Live" ? "live" : "repo"}`}>{status}</div>
      </div>
      <div className="app-copy"><span className="category-tag">{app.category}</span><h3>{app.name}</h3><p>{app.description}</p></div>
      <div className="app-meta"><span>{app.platform}</span><span>{version}</span></div>
      <div className="card-actions">{app.url ? <a className="primary-button" href={app.url} target="_blank" rel="noreferrer">Open App</a> : <button className="primary-button disabled" disabled>Link Pending</button>}<button className="secondary-button" onClick={() => onShare({ name: app.name, url: app.url || app.repo })}>Share</button></div>
      <details><summary>Details</summary><div className="details-body"><span>{app.linkSource}{sync?.synced ? " · source synced" : ""}</span><a href={app.repo} target="_blank" rel="noreferrer">Repository</a></div></details>
    </article>
  );
}

function ShareCard({ target, onShare }: { target: ShareTarget; onShare: (target: ShareTarget) => Promise<void> }) {
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(target.url)}&color=00bfae&bgcolor=070b0a`;
  return <div className="share-card"><div className="qr-frame"><img className="qr-image" src={qr} alt={`QR code for ${target.name}`} /><div className="qr-logo"><img src="/logo2.png" alt="" aria-hidden="true" /></div></div><strong>{target.name}</strong><p>{target.url}</p><button className="primary-button full" onClick={() => onShare(target)}>Share / Copy Link</button></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><h2>{title}</h2><button onClick={onClose} aria-label="Close">×</button></div>{children}</section></div>;
}
