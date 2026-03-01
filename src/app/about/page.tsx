import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-16 md:pt-20">
        {/* About Orientation Section */}
        <section className="py-8 md:py-16 bg-black">
          <div className="max-w-[1600px] mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">About Orientation</h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
              Saving time and effort in explaining the company's project by the project's sales team.
            </p>
            <div className="space-y-4 md:space-y-6 text-gray-300 max-w-4xl text-sm md:text-base">
              <p>
                Sales teams in development companies often struggle to focus on selling because they spend too much time explaining projects to potential clients. This happens at inappropriate times, disrupting their workflow and reducing their effectiveness.
              </p>
              <p>
                Orientation solves this problem by providing a comprehensive video platform where sales teams can watch orientation episodes anytime, anywhere. This allows them to stay informed about all company projects without interrupting their sales activities, leading to better performance and more successful deals.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Orientation Section */}
        <section className="py-8 md:py-16 bg-black">
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Image on Left */}
              <div className="order-2 lg:order-1">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src="/assets/about-us/about-us-1.png"
                    alt="Family watching orientation videos"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Features on Right */}
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 md:mb-8">Why Choose Orientation</h2>

                <div className="space-y-6 md:space-y-8">
                  {/* Feature 1 */}
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">All Company Project Orientations</h3>
                      <p className="text-gray-300 text-sm md:text-base">
                        Access comprehensive orientation videos for all company projects in one place. Get detailed information about each project through engaging video content that makes it easy to understand and present to clients.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Watch Everywhere</h3>
                      <p className="text-gray-300 text-sm md:text-base">
                        Sales brokers can view orientation videos anywhere, anytime. Whether you're at the office, meeting with clients, or on the go, access all project information on any device. This flexibility leads to better focus and deeper knowledge of available projects.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">Easy to Subscribe</h3>
                      <p className="text-gray-300 text-sm md:text-base">
                        No financial subscriptions required for sales teams. Registration is simple and straightforward, making it easy to access and view all available projects. Start using the platform immediately after signing up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
