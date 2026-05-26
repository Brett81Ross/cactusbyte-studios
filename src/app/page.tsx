export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        Building the <span className="text-blue-500">Future</span>, <br />
        One Byte at a Time.
      </h2>
      
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
        CactusByte Studios is a high-performance digital laboratory. 
        We build AI-driven tools and scalable software designed to 
        solve complex problems with elegant code.
      </p>

      <div className="flex gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition">
          View Projects
        </button>
        <button className="border border-gray-700 hover:border-gray-500 text-white px-8 py-3 rounded-full font-semibold transition">
          Contact Us
        </button>
      </div>
    </div>
  );
}
