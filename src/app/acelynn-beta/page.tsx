export const metadata = {
  title: "Acelynn Pro Beta Test | CactusByte Studios",
  description: "Join the Acelynn Pro Android closed test on Google Play.",
};

const groupUrl = "https://groups.google.com/g/acelynn-pro-testers";
const playUrl = "https://play.google.com/apps/testing/com.cactusbyte.acelynnpro";

export default function AcelynnBetaPage() {
  return (
    <main className="beta-shell">
      <section className="beta-card" aria-labelledby="beta-title">
        <header className="beta-hero">
          <div className="beta-wave" aria-hidden="true"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
          <p className="beta-eyebrow">ACELYNN PRO™</p>
          <h1 id="beta-title">Help test Acelynn Pro™</h1>
          <div className="beta-badge">ANDROID CLOSED BETA</div>
          <p className="beta-kicker">Hear the mix. See the problem. Make the move.</p>
          <p className="beta-lede">Mix analysis for musicians, producers, and AI-music creators—frequency balance, revision comparison, and actionable feedback without the guesswork.</p>
          <div className="beta-hero-actions">
            <a className="beta-button beta-button-primary" href={groupUrl} target="_blank" rel="noreferrer">Join Tester Group</a>
            <a className="beta-button beta-button-secondary" href={playUrl} target="_blank" rel="noreferrer">Get Acelynn Pro</a>
          </div>
        </header>

        <div className="beta-flow-label">THREE STEPS. THEN YOU&apos;RE IN.</div>
        <div className="beta-steps">
          <article className="beta-step"><span className="beta-number">1</span><div><h2>Join the tester group</h2><p>Use the Google account you use on Google Play.</p></div></article>
          <article className="beta-step"><span className="beta-number">2</span><div><h2>Opt into the closed test</h2><p>With that same account, activate your Acelynn Pro tester access.</p></div></article>
          <article className="beta-step"><span className="beta-number">3</span><div><h2>Install & test</h2><p>Run a real mix analysis, then send feedback to <a href="mailto:cactusbytestudios@gmail.com">cactusbytestudios@gmail.com</a>.</p></div></article>
        </div>

        <aside className="beta-note"><span aria-hidden="true">!</span><p><strong>Use one Google account all the way through.</strong> Different accounts can prevent access. Android/Google Play devices only.</p></aside>

        <footer className="beta-footer"><a href="/">Cactus🌵Byte Studios™</a><span>•</span><span>Acelynn Pro™ closed test</span><span>•</span><span>v1.2.1</span></footer>
      </section>
    </main>
  );
}
