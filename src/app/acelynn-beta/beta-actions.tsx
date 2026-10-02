"use client";

import { useRef, useState } from "react";
import styles from "./beta.module.css";

export function ActionIcon({ name }: { name: "download" | "share" | "qr" | "join" }) {
  const paths = {
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 16v5h16v-5"/></>,
    share: <><path d="M14 3h7v7m0-7L10 14"/><path d="M10 5H4v16h16v-7"/></>,
    qr: <><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zm6 0h1v3m-7 4h3m4-3v3h-3"/></>,
    join: <><path d="M10 21V5a2 2 0 0 1 4 0v16M10 14H7a3 3 0 0 1-3-3V7m10 5h3a3 3 0 0 0 3-3V5M8 21h8"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function BetaActions({ betaUrl, groupUrl, playUrl, qrMarkup }: { betaUrl: string; groupUrl: string; playUrl: string; qrMarkup: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  async function copyLink() {
    try { await navigator.clipboard.writeText(betaUrl); setStatus("Beta page link copied."); }
    catch { setManualCopy(true); setStatus("Select and copy the link below."); }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: "Acelynn Pro™ Android Beta", text: "Help test Acelynn Pro—mix analysis for music creators.", url: betaUrl });
      else await copyLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyLink();
    }
  }
  return <>
    <nav className={styles.actions} aria-label="Acelynn beta actions">
      <a className={styles.action} href={playUrl} target="_blank" rel="noreferrer"><ActionIcon name="download" />Android App</a>
      <button className={styles.action} onClick={() => void share()}><ActionIcon name="share" />Share</button>
      <button className={styles.action} onClick={() => dialog.current?.showModal()}><ActionIcon name="qr" />QR Code</button>
      <a className={`${styles.action} ${styles.join}`} aria-label="Join Tester Group" href={groupUrl} target="_blank" rel="noreferrer"><ActionIcon name="join" />Join Group</a>
    </nav>
    <p className={styles.status} role="status">{status}</p>
    {manualCopy && <input className={styles.copyField} aria-label="Beta page link to copy" value={betaUrl} readOnly onFocus={event => event.currentTarget.select()} />}
    <dialog className={styles.dialog} ref={dialog} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }} aria-labelledby="beta-qr-title">
      <div className={styles.dialogHead}><h2 id="beta-qr-title">Share Acelynn Pro™</h2><button className={styles.close} aria-label="Close QR code" onClick={() => dialog.current?.close()}>×</button></div>
      <p>Scan to open this beta tester page.</p>
      <div className={styles.qrFrame}>
        <div className={styles.qr} role="img" aria-label="QR code for the Acelynn Pro beta tester page" dangerouslySetInnerHTML={{ __html: qrMarkup }} />
        <img className={styles.qrLogo} src="/acelynn-beta-icon.png" alt="" width="1280" height="1280" />
      </div>
      <button className={`${styles.action} ${styles.getApp}`} onClick={() => void copyLink()}>Copy beta link</button>
      <p role="status">{status}</p>
      {manualCopy && <input className={styles.copyField} aria-label="QR beta link to copy" value={betaUrl} readOnly onFocus={event => event.currentTarget.select()} />}
    </dialog>
  </>;
}
