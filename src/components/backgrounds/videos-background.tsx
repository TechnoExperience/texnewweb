/**
 * Videos Page Background
 * Cinematic background with screen-like effects
 */

export function VideosBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black">
        {/* Screen Scan Lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(100)].map((_, i) => (
            <div
              key={`scanline-${i}`}
              className="absolute w-full h-px bg-[#00F9FF]"
              style={{
                top: `${i * 1}%`,
                animation: `scanlineMove ${0.1 + (i % 5) * 0.02}s linear infinite`,
                animationDelay: `${i * 0.01}s`,
                opacity: 0.1 + (i % 3) * 0.05
              }}
            />
          ))}
        </div>

        {/* Video Frame Effects */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`frame-${i}`}
              className="absolute border-2 border-[#00F9FF]/20"
              style={{
                width: `${200 + i * 50}px`,
                height: `${150 + i * 40}px`,
                left: `${(i * 12.5) % 100}%`,
                top: `${(i * 15) % 100}%`,
                animation: `framePulse ${4 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                boxShadow: `0 0 30px rgba(0, 249, 255, 0.2)`
              }}
            />
          ))}
        </div>

        {/* Play Button Icons - Floating */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`play-icon-${i}`}
              className="absolute"
              style={{
                left: `${(i * 16.67) % 100}%`,
                top: `${(i * 20) % 100}%`,
                width: '60px',
                height: '60px',
                border: `3px solid rgba(0, 249, 255, ${0.2 - i * 0.02})`,
                borderRadius: '50%',
                animation: `playIconFloat ${8 + i * 1}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `15px solid rgba(0, 249, 255, ${0.3 - i * 0.03})`,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  marginLeft: '3px'
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#00F9FF]/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#00F9FF]/10 to-transparent" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
      </div>

      <style>{`
        @keyframes scanlineMove {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes framePulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes playIconFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(30px, -40px) rotate(180deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  )
}

