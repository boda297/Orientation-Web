interface Orientation {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  rank: number;
}

const orientations: Orientation[] = [
  {
    id: '1',
    title: 'LVERSAN NORTH COAST PRESENTS',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rank: 1
  },
  {
    id: '2',
    title: 'ALBASIONY DEVELOPMENTS CAVALI RESIDENCE NEW CAIRO',
    subtitle: 'WE ARE COLLECTING EOI\'S FROM 6 JULY 50,000 EGP',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
    rank: 2
  },
  {
    id: '3',
    title: 'THARAA',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    rank: 3
  },
  {
    id: '4',
    title: 'Seashore RAS EL HEKMA FULLY FINISHED UNITS',
    subtitle: '5% DOWN PAYMENT',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    rank: 4
  },
  {
    id: '5',
    title: 'masaya SIDI-ABDELRAHMAN',
    thumbnail: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400',
    rank: 5
  },
  {
    id: '6',
    title: 'RAFTS OF ARK NEW ZAYED',
    subtitle: 'AN ORIENTATION BY AZIZ FILMS',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    rank: 6
  }
];

export default function TopOrientations() {
  return (
    <section className="py-12 bg-black">
      <div className="max-w-[1600px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8">Top 10 Orientations</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {orientations.map((orientation) => (
            <div
              key={orientation.id}
              className="flex-shrink-0 w-64 group cursor-pointer relative"
            >
              <div className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundImage: `url(${orientation.thumbnail})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl">
                  {orientation.rank}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm mb-2">{orientation.title}</h3>
                  {orientation.subtitle && (
                    <p className="text-gray-300 text-xs">{orientation.subtitle}</p>
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
