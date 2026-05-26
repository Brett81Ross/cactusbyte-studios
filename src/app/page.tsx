export default function Home() {
  return (
    <main className="p-4 md:p-8">
      {/* Container to keep content clean and readable */}
      <div className="max-w-xl mx-auto space-y-6">
        
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Market Analysis: <br />
            <span className="text-blue-500">Surreal Rabbit Art</span>
          </h2>
        </header>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h3 className="text-xl font-semibold text-white mb-2 border-b border-gray-800 pb-1">Market Data</h3>
            <ul className="space-y-2 text-base leading-normal">
              <li><strong className="text-white">Low:</strong> $30 – $45 (Unframed)</li>
              <li><strong className="text-white">Mid:</strong> $60 – $90 (Canvas)</li>
              <li><strong className="text-white">High:</strong> $120 – $180 (Framed)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-2 border-b border-gray-800 pb-1">Sell-Through Signal</h3>
            <p className="text-base leading-normal">
              <strong className="text-white">Speed:</strong> Average to Slow. This piece targets specific niches like pop-surrealism and gothic decor. It isn't for everyone, but collectors in these niches will pay a premium.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-2 border-b border-gray-800 pb-1">Listing Recommendation</h3>
            <p className="text-base leading-normal italic text-gray-400 bg-gray-900 p-4 rounded-lg border border-gray-800">
              "Add a mesmerizing touch of the bizarre to your space with this stunning pop-surrealist art piece. Featuring a hyper-realistic rabbit with four expressive eyes, this print is the ultimate conversation starter."
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

