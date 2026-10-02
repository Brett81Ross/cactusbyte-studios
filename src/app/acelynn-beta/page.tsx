import type { Metadata } from "next";
import QRCode from "qrcode";
import BetaActions, { ActionIcon } from "./beta-actions";
import styles from "./beta.module.css";

const betaUrl = "https://cactusbyte-studios.vercel.app/acelynn-beta";
const groupUrl = "https://groups.google.com/g/acelynn-pro-testers";
const playUrl = "https://play.google.com/apps/testing/com.cactusbyte.acelynnpro";

export const metadata: Metadata = {
  title: "Acelynn Pro™ Android Beta",
  description: "Help test Acelynn Pro. Join the tester group, opt into the Google Play closed test, and analyze your mixes.",
  alternates: { canonical: betaUrl },
  openGraph: { title: "Help test Acelynn Pro™", description: "Join the Android closed beta for musicians, producers, and AI-music creators.", url: betaUrl, images: ["/acelynn-beta-icon.png"] },
  icons: { icon: "/acelynn-beta-icon.png", apple: "/acelynn-beta-icon.png" },
};

function Waveform({ className }: { className: string }) {
  const heights = [3,5,4,8,12,7,18,10,24,13,8,32,17,10,20,45,70,112,156,95,52,27,42,18,31,12,24,55,26,13,35,18,9,28,14,43,20,10,31,8,18,6,12,5,8,3];
  return <div className={className} aria-hidden="true">{heights.map((height, i) => <i key={i} style={{ height: `${height / 1.56}%` }} />)}</div>;
}

export default async function AcelynnBetaPage() {
  const qrMarkup = await QRCode.toString(betaUrl, { type: "svg", errorCorrectionLevel: "H", margin: 4, color: { dark: "#063e48", light: "#ffffff" } });
  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="beta-title">
        <header className={styles.hero}>
          <div className={styles.brand}>
            <Waveform className={styles.logoWave} />
            <div className={styles.microphone}><img src="/acelynn-beta-icon.png" alt="Acelynn Pro microphone logo" width="1280" height="1280" fetchPriority="high" /></div>
          </div>
          <div className={styles.titleRow}>
            <Waveform className={styles.titleWave} />
            <h1 id="beta-title">Help test <span>Acelynn Pro<sup>™</sup></span></h1>
          </div>
          <div className={styles.badge}>ANDROID CLOSED BETA</div>
          <p className={styles.lede}>Analyze mixes with clarity, precision, and depth.</p>
          <p className={styles.audience}>For musicians, producers, and AI-music creators.</p>
        </header>

        <BetaActions betaUrl={betaUrl} groupUrl={groupUrl} playUrl={playUrl} qrMarkup={qrMarkup} />

        <div className={styles.steps}>
          <article className={styles.step}>
            <span className={styles.number} aria-hidden="true">1</span>
            <div><h2><a href={groupUrl} target="_blank" rel="noreferrer">Join the tester group</a></h2><p>You’ll need a Google account to join. Use the account you use on Google Play.</p></div>
          </article>
          <article className={styles.step}>
            <span className={styles.number} aria-hidden="true">2</span>
            <div><h2>Opt into the test</h2><a className={styles.getApp} href={playUrl} target="_blank" rel="noreferrer"><ActionIcon name="download" />Get Acelynn Pro</a></div>
          </article>
          <article className={styles.step}>
            <span className={styles.number} aria-hidden="true">3</span>
            <div><h2>Install &amp; test</h2><p>Install from Google Play after opting in, then put a real mix through its paces. We’d love your feedback!</p><p>Send feedback to: <a className={styles.feedback} href="mailto:cactusbytestudios@gmail.com">cactusbytestudios@gmail.com</a></p></div>
          </article>
        </div>

        <aside className={styles.note}>
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M14 5a2.3 2.3 0 0 1 4 0l12 22a2 2 0 0 1-2 3H4a2 2 0 0 1-2-3Z"/><path d="M16 12v8m0 4v1"/></svg>
          <div><h2>Important note</h2><p>Please use the same Google account to join the tester group and install the app. Different accounts can prevent access. This test is for Android devices.</p></div>
        </aside>
        <footer className={styles.footer}><a href="/">Cactus🌵Byte Studios™</a><span> · Acelynn Pro™ closed test · Beta page v1.2.2</span><span>All Rights Reserved</span></footer>
      </section>
    </main>
  );
}
