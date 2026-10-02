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
        <div className="beta-brand">Cactus🌵Byte Studios™</div>
        <div className="beta-badge">ANDROID CLOSED BETA</div>
        <h1 id="beta-title">Help test Acelynn Pro™</h1>
        <p className="beta-lede">
          Acelynn Pro helps musicians and producers analyze mixes, compare revisions,
          inspect frequency balance, and turn results into actionable mix decisions.
        </p>

        <div className="beta-steps">
          <article className="beta-step">
            <span className="beta-number">1</span>
            <div>
              <h2>Join the tester group</h2>
              <p>Use the Google account you use with Google Play.</p>
              <a className="beta-button" href={groupUrl} target="_blank" rel="noreferrer">
                Join Tester Group
              </a>
            </div>
          </article>

          <article className="beta-step">
            <span className="beta-number">2</span>
            <div>
              <h2>Opt into the test</h2>
              <p>After joining the group, become an Acelynn Pro tester on Google Play.</p>
              <a className="beta-button beta-button-primary" href={playUrl} target="_blank" rel="noreferrer">
                Get Acelynn Pro
              </a>
            </div>
          </article>

          <article className="beta-step beta-step-last">
            <span className="beta-number">3</span>
            <div>
              <h2>Install & test</h2>
              <p>
                Install Acelynn Pro from Google Play and put it through a real mix-analysis session.
                Feedback is welcome at <a href="mailto:cactusbytestudios@gmail.com">cactusbytestudios@gmail.com</a>.
              </p>
            </div>
          </article>
        </div>

        <aside className="beta-note">
          <strong>Important:</strong> use the same Google account for the tester group and Google Play.
          This closed test is for Android/Google Play devices.
        </aside>

        <footer className="beta-footer">
          <a href="/">Cactus🌵Byte Studios™</a>
          <span>•</span>
          <span>Acelynn Pro™ closed testing</span>
        </footer>
      </section>
    </main>
  );
}
