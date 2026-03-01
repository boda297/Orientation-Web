'use client';

interface Developer {
  id: string;
  name: string;
  tagline?: string;
  thumbnail: string;
}

const developers: Developer[] = [
  {
    id: '1',
    name: 'MARGINS DEVELOPMENTS',
    tagline: 'PAVING A NEW WAY',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
  },
  {
    id: '2',
    name: 'THARAA DEVELOPMENTS',
    tagline: 'FROM CONCEPT TO CREATION',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'
  },
  {
    id: '3',
    name: 'EGTowers',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
  },
  {
    id: '4',
    name: 'Novara',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400'
  },
  {
    id: '5',
    name: 'The ARK',
    thumbnail: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400'
  },
  {
    id: '6',
    name: 'REJAN Developments',
    tagline: 'SECURE YOUR ADMIN UNIT NEXT YEAR WITH *25 DOWN PAYMENT 4 YEARS OF INSTALLMENTS',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  }
];
import { useEffect, useState, useRef } from 'react';

export default function TopDevelopers() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-4 md:py-6 bg-black">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Meet Top Developers</h2>
          <button className="text-red-600 hover:text-red-500 transition-colors text-sm md:text-base">
            View All
          </button>
        </div>
        <div
          ref={scrollContainerRef}
          className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {developers.map((developer) => (
            <div
              key={developer.id}
              onClick={(e) => isDragging && e.preventDefault()}
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 group relative"
            >
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-3">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundImage: `url(${developer.thumbnail})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold text-lg mb-1">{developer.name}</h3>
                  {developer.tagline && (
                    <p className="text-gray-300 text-sm">{developer.tagline}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
