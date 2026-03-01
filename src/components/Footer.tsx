export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8 md:py-12">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-red-600">Orientation</h3>
            </div>
            <p className="text-white font-semibold mb-4 text-sm md:text-base">
              Real Estate Video Platform for Developers, Brokers & Sales Agents
            </p>
            <p className="text-gray-400 mb-4 text-sm md:text-base">
              Orientation is the first video platform designed for the real estate industry. Developers showcase their projects, and brokers & sales agents can access on-demand orientations anytime, anywhere. Save time, focus on the right projects, and stay ahead in the market.
            </p>
            <p className="text-white mb-2 text-sm md:text-base">Email us: <a href="mailto:marketing@orientationre.com" className="text-red-600 hover:underline">marketing@orientationre.com</a></p>
            <p className="text-white text-sm md:text-base">Helpline number: <span className="font-bold">+(20) 105 521 9636</span></p>
          </div>
          
          <div>
            <h3 className="text-white text-lg md:text-xl font-semibold mb-4">Subscribe Newsletter</h3>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600 text-sm md:text-base"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm text-center">
            © 2025 <span className="text-red-600">AlRawaabit</span>. All Rights Reserved. All videos and shows on this platform are trademarks of, and all related images and content are the property of, Aziz Film. Duplication and copy of this is strictly prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
}
