/**
 * Store Page Background
 * Shopping/e-commerce inspired background with product-like elements
 */

export function StoreBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black">
        {/* Shopping Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 249, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 249, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'gridShift 20s linear infinite'
          }} />
        </div>

        {/* Floating Product Cards */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`product-card-${i}`}
              className="absolute rounded-lg border-2 border-[#00F9FF]/20 bg-white/5"
              style={{
                width: `${150 + i * 30}px`,
                height: `${200 + i * 40}px`,
                left: `${(i * 12.5) % 100}%`,
                top: `${(i * 15) % 100}%`,
                animation: `productCardFloat ${12 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
                boxShadow: `0 0 40px rgba(0, 249, 255, 0.1)`,
                transform: `rotate(${i * 5}deg)`
              }}
            >
              {/* Card Content Placeholder */}
              <div className="absolute inset-2 bg-gradient-to-br from-zinc-900 to-black rounded" />
              <div className="absolute top-3 left-3 right-3 h-20 bg-white/5 rounded" />
              <div className="absolute bottom-3 left-3 right-3 h-4 bg-white/10 rounded" />
              <div className="absolute bottom-10 left-3 right-3 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>

        {/* Price Tags - Floating */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`price-tag-${i}`}
              className="absolute"
              style={{
                left: `${(i * 16.67) % 100}%`,
                top: `${(i * 20) % 100}%`,
                width: '80px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(0, 249, 255, 0.2), rgba(0, 249, 255, 0.1))',
                border: '2px solid rgba(0, 249, 255, 0.3)',
                borderRadius: '4px',
                animation: `priceTagFloat ${10 + i * 1.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
                boxShadow: `0 0 20px rgba(0, 249, 255, 0.2)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-[#00F9FF] text-xs font-bold">
                €{Math.floor(Math.random() * 100)}
              </div>
            </div>
          ))}
        </div>

        {/* Shopping Bag Icons */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={`bag-${i}`}
              className="absolute"
              style={{
                left: `${(i * 20) % 100}%`,
                top: `${(i * 25) % 100}%`,
                width: '60px',
                height: '60px',
                border: `3px solid rgba(0, 249, 255, ${0.2 - i * 0.02})`,
                borderRadius: '8px',
                animation: `bagFloat ${15 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 1.2}s`,
                opacity: 0.3
              }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 border-2 border-[#00F9FF]/30 rounded-t-lg" />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 border-2 border-[#00F9FF]/30 rounded-b-lg" />
            </div>
          ))}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${500 + i * 150}px`,
                height: `${500 + i * 150}px`,
                left: `${(i * 25) % 100}%`,
                top: `${(i * 30) % 100}%`,
                background: `radial-gradient(circle, rgba(0, 249, 255, ${0.12 - i * 0.02}) 0%, transparent 70%)`,
                animation: `orbFloat ${18 + i * 3}s ease-in-out infinite`,
                animationDelay: `${i * 1.5}s`,
                filter: 'blur(70px)'
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
      </div>

      <style>{`
        @keyframes gridShift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(80px, 80px);
          }
        }

        @keyframes productCardFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(${0}deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(40px, -60px) rotate(${10}deg);
            opacity: 0.5;
          }
        }

        @keyframes priceTagFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(30px, -50px) scale(1.1);
            opacity: 0.7;
          }
        }

        @keyframes bagFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(50px, -70px) rotate(15deg);
            opacity: 0.5;
          }
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(60px, -90px) scale(1.15);
          }
          66% {
            transform: translate(-60px, 90px) scale(0.85);
          }
        }
      `}</style>
    </>
  )
}

