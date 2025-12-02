/**
 * Releases Page Background
 * Unique animated background with vinyl-inspired elements
 */

export function ReleasesBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black">
        {/* Vinyl Groove Pattern - Animated */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => {
            const radius = 20 + (i * 2.5)
            const angle = (i * 12) % 360
            return (
              <div
                key={`groove-${i}`}
                className="absolute rounded-full border border-[#00F9FF]/30"
                style={{
                  width: `${radius * 2}%`,
                  height: `${radius * 2}%`,
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  animation: `vinylSpin ${30 + (i % 5) * 2}s linear infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            )
          })}
        </div>

        {/* Floating Sound Waves */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`wave-${i}`}
              className="absolute"
              style={{
                left: `${(i * 12.5) % 100}%`,
                top: `${20 + (i % 3) * 30}%`,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, rgba(0, 249, 255, ${0.1 + (i % 3) * 0.05}) 0%, transparent 70%)`,
                borderRadius: '50%',
                animation: `soundWave ${8 + (i % 3) * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                filter: 'blur(40px)'
              }}
            />
          ))}
        </div>

        {/* Rotating Discs */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => {
            const size = 300 + (i % 3) * 150
            return (
              <div
                key={`disc-${i}`}
                className="absolute rounded-full border-4 border-[#00F9FF]/20"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${(i * 15) % 100}%`,
                  top: `${(i * 20) % 100}%`,
                  background: `conic-gradient(from ${i * 60}deg, transparent, rgba(0, 249, 255, 0.1), transparent)`,
                  animation: `discRotate ${20 + i * 3}s linear infinite`,
                  animationDelay: `${i * 1.5}s`,
                  opacity: 0.3
                }}
              />
            )
          })}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${400 + i * 100}px`,
                height: `${400 + i * 100}px`,
                left: `${(i * 20) % 100}%`,
                top: `${(i * 25) % 100}%`,
                background: `radial-gradient(circle, rgba(0, 249, 255, ${0.15 - i * 0.02}) 0%, transparent 70%)`,
                animation: `orbFloat ${15 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
                filter: 'blur(60px)'
              }}
            />
          ))}
        </div>

        {/* Animated Grid - Vinyl Style */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(0, 249, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'gridPulse 4s ease-in-out infinite'
          }} />
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
      </div>

      <style>{`
        @keyframes vinylSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes soundWave {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.6;
          }
        }

        @keyframes discRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 50px) scale(0.9);
          }
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </>
  )
}

