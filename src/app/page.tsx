export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      {/* Container for the content with a max-width for readability */}
      <div className="max-w-3xl w-full">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
          Market Analysis: <br />
          <span className="text-blue-500">Surreal Rabbit Art</span>
        </h2>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h3 className="text-2xl font-bold text-white mb-3">Market Data</h3>
            <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed">
              <li><span className="font-semibold text-white">Low Range ($30 – $45):</span> Unframed poster or basic print.</li>
              <li><span className="font-semibold text-white">Mid Range ($60 – $90):</span> Standard gallery-wrapped canvas.</li>
              <li><span className="font-semibold text-white">High Range ($120 – $180):</span> Large-format, custom-framed print.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-3">Sell-Through Signal</h3>
            <p className="text-lg leading-relaxed">
              The speed of sale is <strong className="text-white">Average to Slow</strong>. This piece appeals to specific niches like pop-surrealism and gothic decor. It is not for traditional buyers, but collectors in these specific niches will pay a premium.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-3">Listing Recommendation</h3>
            <p className="text-lg leading-relaxed bg-gray-900 p-6 rounded-xl border border-gray-800">
              "Add a mesmerizing touch of the bizarre to your space with this stunning pop-surrealist art piece. Featuring a highly detailed, hyper-realistic rabbit with four expressive eyes emerging from a textured carrot, this print is the ultimate conversation starter."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
