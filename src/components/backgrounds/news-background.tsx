/**
 * News Page Background
 * Typography-inspired background with text effects
 */

export function NewsBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black">
        {/* Typography Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 249, 255, 0.1) 2px, rgba(0, 249, 255, 0.1) 4px),
                              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 249, 255, 0.1) 2px, rgba(0, 249, 255, 0.1) 4px)`,
            backgroundSize: '100px 100px'
          }} />
        </div>

        {/* Floating Text Elements */}
        <div className="absolute inset-0">
          {['NEWS', 'TECHNO', 'EXPERIENCE', 'MAGAZINE'].map((text, i) => (
            <div
              key={`text-${i}`}
              className="absolute text-[#00F9FF] font-bold opacity-5"
              style={{
                fontSize: `${120 + i * 40}px`,
                left: `${(i * 25) % 100}%`,
                top: `${(i * 30) % 100}%`,
                fontFamily: "'Bebas Neue', system-ui, sans-serif",
                animation: `textFloat ${15 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 1.5}s`,
                transform: `rotate(${i * 15}deg)`
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Reading Lines */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute w-full h-px bg-[#00F9FF]/10"
              style={{
                top: `${10 + i * 10}%`,
                animation: `lineGlow ${3 + (i % 3) * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>

        {/* Article Cards Shadow Effect */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`card-shadow-${i}`}
              className="absolute rounded-lg bg-[#00F9FF]/5"
              style={{
                width: `${300 + i * 50}px`,
                height: `${200 + i * 40}px`,
                left: `${(i * 16.67) % 100}%`,
                top: `${(i * 20) % 100}%`,
                animation: `cardShadow ${12 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 1}s`,
                boxShadow: `0 0 60px rgba(0, 249, 255, 0.1)`
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
      </div>

      <style>{`
        @keyframes textFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(${0}deg);
            opacity: 0.05;
          }
          50% {
            transform: translate(50px, -80px) rotate(${15}deg);
            opacity: 0.1;
          }
        }

        @keyframes lineGlow {
          0%, 100% {
            opacity: 0.1;
            box-shadow: 0 0 10px rgba(0, 249, 255, 0.1);
          }
          50% {
            opacity: 0.3;
            box-shadow: 0 0 30px rgba(0, 249, 255, 0.3);
          }
        }

        @keyframes cardShadow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.05;
          }
          50% {
            transform: translate(30px, -40px) scale(1.1);
            opacity: 0.15;
          }
        }
      `}</style>
    </>
  )
}

