/**
 * Animated Background Component
 * Reusable animated background with black and gray shapes
 */

export function AnimatedBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Animated Grid Lines - More visible */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={`grid-${i}`}
              className="animated-grid-line"
              style={{
                left: `${(i * 5) % 100}%`,
                '--delay': `${i * 0.15}s`,
                '--duration': `${18 + (i % 4) * 2}s`
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Floating Geometric Shapes - Gray tones for visibility */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => {
            const size = 100 + (i % 5) * 50
            const grayLevel = i % 3
            return (
              <div
                key={`shape-${i}`}
                className={`animated-geometric-shape shape-${grayLevel}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${(i * 6.67) % 100}%`,
                  top: `${(i * 8) % 100}%`,
                  '--delay': `${i * 0.3}s`,
                  '--duration': `${22 + (i % 4) * 2}s`,
                  '--rotation': `${i * 30}deg`
                } as React.CSSProperties}
              />
            )
          })}
        </div>

        {/* Animated Circles - Gray tones */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => {
            const size = 120 + (i % 4) * 60
            const grayLevel = i % 2
            return (
              <div
                key={`circle-${i}`}
                className={`animated-circle circle-${grayLevel}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${(i * 8.33) % 100}%`,
                  top: `${(i * 10) % 100}%`,
                  '--delay': `${i * 0.4}s`,
                  '--duration': `${20 + (i % 3) * 2}s`
                } as React.CSSProperties}
              />
            )
          })}
        </div>

        {/* Subtle Gradient Overlay - Lighter for visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900/30 to-black" />
      </div>

      <style>{`
        /* Animated Grid Lines - More visible */
        .animated-grid-line {
          position: absolute;
          width: 2px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(161, 161, 170, 0.4),
            rgba(161, 161, 170, 0.6),
            rgba(161, 161, 170, 0.4),
            transparent
          );
          animation: gridLineMove var(--duration, 18s) var(--delay, 0s) infinite linear;
        }

        @keyframes gridLineMove {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          5% {
            opacity: 0.6;
          }
          95% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        /* Geometric Shapes - Gray tones for visibility */
        .animated-geometric-shape {
          position: absolute;
          border: 3px solid;
          transform-style: preserve-3d;
          animation: geometricFloat var(--duration, 22s) var(--delay, 0s) infinite ease-in-out;
        }

        .shape-0 {
          border-color: rgba(161, 161, 170, 0.5);
          background: rgba(161, 161, 170, 0.15);
        }

        .shape-1 {
          border-color: rgba(113, 113, 122, 0.6);
          background: rgba(113, 113, 122, 0.2);
        }

        .shape-2 {
          border-color: rgba(82, 82, 91, 0.5);
          background: rgba(82, 82, 91, 0.15);
        }

        .animated-geometric-shape::before {
          content: '';
          position: absolute;
          inset: -15px;
          border: 2px solid;
          border-color: inherit;
          opacity: 0.6;
          transform: rotate(45deg);
        }

        @keyframes geometricFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(var(--rotation, 0deg)) scale(1);
            opacity: 0.5;
          }
          25% {
            transform: translateY(-50px) translateX(40px) rotate(calc(var(--rotation, 0deg) + 90deg)) scale(1.15);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-100px) translateX(0) rotate(calc(var(--rotation, 0deg) + 180deg)) scale(0.9);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-50px) translateX(-40px) rotate(calc(var(--rotation, 0deg) + 270deg)) scale(1.15);
            opacity: 0.7;
          }
        }

        /* Animated Circles - Gray tones */
        .animated-circle {
          position: absolute;
          border-radius: 50%;
          border: 3px solid;
          transform-style: preserve-3d;
          animation: circleFloat var(--duration, 20s) var(--delay, 0s) infinite ease-in-out;
        }

        .circle-0 {
          border-color: rgba(161, 161, 170, 0.5);
          background: radial-gradient(circle, rgba(161, 161, 170, 0.25) 0%, transparent 70%);
        }

        .circle-1 {
          border-color: rgba(113, 113, 122, 0.6);
          background: radial-gradient(circle, rgba(113, 113, 122, 0.3) 0%, transparent 70%);
        }

        .animated-circle::before {
          content: '';
          position: absolute;
          inset: 25px;
          border: 2px solid;
          border-color: inherit;
          border-radius: 50%;
          opacity: 0.7;
        }

        @keyframes circleFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.4;
          }
          33% {
            transform: translateY(-60px) translateX(50px) scale(1.25);
            opacity: 0.6;
          }
          66% {
            transform: translateY(-120px) translateX(-30px) scale(0.85);
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  )
}

