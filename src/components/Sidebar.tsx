export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-red-900/90 to-black/90 backdrop-blur-sm z-40 border-r border-red-900/50 hidden lg:flex flex-col items-center py-8 px-6">
      <div className="mb-8">
        <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-4">
          <div className="text-4xl font-bold text-black">DC</div>
        </div>
        <p className="text-white text-lg font-semibold mb-4">New Cairo</p>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Watch Now
        </button>
      </div>
      
      <div className="mt-auto space-y-4">
        <div className="text-white/80 text-sm">
          <p className="mb-2">السلم والثف لعب عيال</p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Latest On Orientations</h3>
        </div>
      </div>
    </aside>
  );
}
