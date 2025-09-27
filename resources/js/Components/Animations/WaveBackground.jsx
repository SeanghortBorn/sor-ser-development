import React, { useMemo } from "react";

export default function RainAndSnow() {
  const rainCount = 300;
  const snowCount = 150;

  // Generate raindrops
  const rainDrops = useMemo(() => {
    return [...Array(rainCount)].map(() => ({
      left: Math.random() * 120 - 10,
      width: Math.random() * 0.3 + 0.1, // thin rain
      opacity: Math.random() * 0.6 + 0.3,
      duration: Math.random() * 1 + 0.5,
      delay: Math.random() * 0.2,
    }));
  }, []);

  // Generate snowflakes
  const snowflakes = useMemo(() => {
    return [...Array(snowCount)].map(() => ({
      left: Math.random() * 100,
      size: Math.random() * 8 + 4,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 0.2,
      sway: Math.random() * 20 - 10,
    }));
  }, []);

  return (
    <>
      <div className="weather absolute inset-0 w-full h-full overflow-hidden">
        {/* Rain */}
        {rainDrops.map((drop, i) => (
          <div
            key={`rain-${i}`}
            className="rain-drop absolute bg-blue-200"
            style={{
              width: `${drop.width}vmin`,
              height: `2vmin`,
              left: `${drop.left}vw`,
              opacity: drop.opacity,
              animation: `rain-fall-${i} ${drop.duration}s linear infinite`,
              animationDelay: `${drop.delay}s`,
            }}
          ></div>
        ))}

        {/* Snow */}
        {snowflakes.map((flake, i) => (
          <div
            key={`snow-${i}`}
            className="snowflake absolute rounded-full bg-white"
            style={{
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              left: `${flake.left}%`,
              opacity: flake.opacity,
              animation: `snow-fall-${i} ${flake.duration}s linear infinite`,
              animationDelay: `${flake.delay}s`,
            }}
          ></div>
        ))}
      </div>

      <style>{`
        body, .weather {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(
            180deg,
            #dbeafe 0%,    
            #93c5fd 40%,   
            #3b82f6 100%   
          );
        }

        ${rainDrops
          .map(
            (_, i) => `
          @keyframes rain-fall-${i} {
            0% { transform: translateY(0); }
            100% { transform: translateY(100vh); }
          }
        `
          )
          .join("\n")}

        ${snowflakes
          .map(
            (_, i) => `
          @keyframes snow-fall-${i} {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(50vh) translateX(${Math.random() *
              20 -
              10}px); }
            100% { transform: translateY(100vh) translateX(${Math.random() *
              20 -
              10}px); }
          }
        `
          )
          .join("\n")}
      `}</style>
    </>
  );
}
