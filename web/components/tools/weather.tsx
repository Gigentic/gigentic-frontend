export function Weather({ city, unit }: { city: string; unit: string }) {
  const data = {
    temperature: 0,
    unit: unit,
    description: 'cloudy',
  };

  if (city === 'London') {
    data.temperature = 12;
    data.description = 'rainy';
  } else if (city === 'Berlin') {
    data.temperature = 25;
    data.description = 'sunny';
  } else {
    data.temperature = 10;
    data.description = 'rainy';
  }

  const isSunny = data.description === 'sunny';

  return (
    <div className="w-64 h-64 bg-gradient-to-b from-sky-400 to-sky-200 rounded-lg shadow-lg p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Sky background */}
        <rect x="0" y="0" width="100" height="100" fill="transparent" />

        {isSunny ? (
          // Sun
          <g>
            <circle cx="50" cy="50" r="20" fill="yellow" />
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 30 * Math.cos((i * Math.PI) / 4)}
                y2={50 + 30 * Math.sin((i * Math.PI) / 4)}
                stroke="yellow"
                strokeWidth="2"
              />
            ))}
          </g>
        ) : (
          // Rain clouds and drops
          <g>
            <path
              d="M25,60 Q40,50 55,60 T85,60 Q70,80 55,75 T25,60"
              fill="#cccccc"
              stroke="#bbbbbb"
              strokeWidth="2"
            />
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1={30 + i * 10}
                y1="70"
                x2={25 + i * 10}
                y2="85"
                stroke="#4299e1"
                strokeWidth="2"
              />
            ))}
          </g>
        )}

        {/* Temperature display */}
        <text
          x="50"
          y="90"
          fontSize="16"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          className="font-sans"
        >
          {data.temperature}°{data.unit}
        </text>
      </svg>
    </div>
  );
}
