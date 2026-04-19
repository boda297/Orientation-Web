const areas = [
  'North Coast',
  'New Alamien',
  'New Capital',
  'New Cairo',
  '6th Of October',
  '6th Settlement'
];

export default function ExploreAreas() {
  return (
    <section className="py-12 bg-black">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Explore Areas</h2>
          <button className="text-red-600 hover:text-red-500 transition-colors">
            View All
          </button>
        </div>
        <div className="flex gap-4 flex-wrap">
          {areas.map((area) => (
            <button
              key={area}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {area}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
