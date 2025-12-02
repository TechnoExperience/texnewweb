/**
 * Events Page Background
 * Dynamic background with pulsing lights and energy waves
 */

export function EventsBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-black via-purple-950/20 to-black">
        {/* Pulsing Light Beams */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={`beam-${i}`}
              className="absolute"
              style={{
                width: '4px',
                height: '100%',
                left: `${(i * 8.33) % 100}%`,
                background: `linear-gradient(to bottom, transparent, rgba(0, 249, 255, ${0.3 + (i % 3) * 0.1}), transparent)`,
                animation: `beamPulse ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                boxShadow: `0 0 20px rgba(0, 249, 255, 0.5)`
              }}
            />
          ))}
        </div>

        {/* Energy Waves */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`energy-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${600 + i * 200}px`,
                height: `${600 + i * 200}px`,
                left: `${(i * 15) % 100}%`,
                top: `${(i * 20) % 100}%`,
                border: `2px solid rgba(0, 249, 255, ${0.2 - i * 0.02})`,
                animation: `energyWave ${6 + i}s ease-out infinite`,
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full bg-[#00F9FF]"
              style={{
                width: `${4 + (i % 3)}px`,
                height: `${4 + (i % 3)}px`,
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
                opacity: 0.6,
                animation: `particleFloat ${10 + (i % 5) * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                boxShadow: `0 0 10px rgba(0, 249, 255, 0.8)`
              }}
            />
          ))}
        </div>

        {/* Gradient Blobs */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={`blob-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${500 + i * 200}px`,
                height: `${500 + i * 200}px`,
                left: `${(i * 25) % 100}%`,
                top: `${(i * 30) % 100}%`,
                background: `radial-gradient(circle, rgba(147, 51, 234, ${0.2 - i * 0.03}) 0%, transparent 70%)`,
                animation: `blobMove ${20 + i * 3}s ease-in-out infinite`,
                animationDelay: `${i * 2}s`,
                filter: 'blur(80px)'
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      </div>

      <style>{`
        @keyframes beamPulse {
          0%, 100% {
            opacity: 0.2;
            transform: scaleY(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scaleY(1);
          }
        }

        @keyframes energyWave {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
          50% {
            transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px);
            opacity: 1;
          }
        }

        @keyframes blobMove {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -80px) scale(1.2);
          }
          66% {
            transform: translate(-50px, 80px) scale(0.8);
          }
        }
      `}</style>
    </>
  )
}

