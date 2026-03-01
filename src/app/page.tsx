import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ContinueWatch from '@/components/ContinueWatch';
import LatestOrientations from '@/components/LatestOrientations';
import TrendingProjects from '@/components/TrendingProjects';
import ProjectsByArea from '@/components/ProjectsByArea';
import UpcomingProjects from '@/components/UpcomingProjects';
import DiscoverAreas from '@/components/DiscoverAreas';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <LatestOrientations />
        <ContinueWatch />
        <TrendingProjects />
        <ProjectsByArea title="Projects in Northcoast" location="Northcoast" />
        <ProjectsByArea title="Projects in New Cairo" location="New Cairo" />
        <ProjectsByArea title="Projects in October" location="October" />
        <UpcomingProjects />
        <DiscoverAreas />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
