import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FreeOrientations from '@/components/FreeOrientations';
import ContinueWatch from '@/components/ContinueWatch';
import LatestOrientations from '@/components/LatestOrientations';
import TrendingProjects from '@/components/TrendingProjects';
import ProjectsByArea from '@/components/ProjectsByArea';
import UpcomingProjects from '@/components/UpcomingProjects';
import DiscoverAreas from '@/components/DiscoverAreas';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { HomepageDataProvider } from '@/lib/hooks/useHomepageData';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/*
        HomepageDataProvider fires 4 parallel requests (featured, all, top10, upcoming)
        and shares the results with every child component below via React Context.
        No child component needs to make its own API call for homepage data.
      */}
      <HomepageDataProvider>
        <main>
          <Hero />
          <FreeOrientations />
          <LatestOrientations />
          <ContinueWatch />
          <TrendingProjects />
          <ProjectsByArea title="Projects in Northcoast" location="Northcoast" />
          <ProjectsByArea title="Projects in New Cairo" location="New Cairo" />
          <ProjectsByArea title="Projects in October" location="October" />
          <UpcomingProjects />
          <DiscoverAreas />
        </main>
      </HomepageDataProvider>
      <Footer />
      <ChatWidget />
    </div>
  );
}
