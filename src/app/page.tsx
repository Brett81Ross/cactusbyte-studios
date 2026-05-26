export default function ResaleIQ() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-4">ResaleIQ</h1>
      <p className="text-gray-400 mb-8">
        Upload your item photos, and let our AI determine the optimal resale value.
      </p>

      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
        <div className="border-2 border-dashed border-gray-700 p-12 text-center rounded-xl hover:border-blue-500 transition cursor-pointer">
          <p className="text-gray-400">Drag & drop photos or click to upload</p>
        </div>
        
        <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
          Analyze Item Value
        </button>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Recent Valuations</h3>
        <div className="bg-gray-900 p-4 rounded-lg text-gray-500 text-center">
          No items analyzed yet. Start by uploading an image above.
        </div>
      </div>
    </div>
  );
}
