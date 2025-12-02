import { Link } from "react-router-dom"

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00f0ff] relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo / Brand Name */}
        <h1 
          className="text-8xl md:text-9xl lg:text-[12rem] font-heading text-[#050315] mb-8 tracking-tighter"
          style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
        >
          TECHNO
          <br />
          EXPERIENCE
        </h1>

        {/* Subtitle */}
        <p className="text-2xl md:text-3xl font-space text-[#050315] mb-16 tracking-wider">
          future is coming...
        </p>

        {/* Social Media Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base font-space text-[#050315]">
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            instagram
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            tiktok
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            facebook
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            x
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            soundcloud
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            youtube
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            linkedin
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            threads
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
            spotify
          </a>
        </div>

        {/* Home Link (optional) */}
        <div className="mt-16">
          <Link 
            to="/"
            className="inline-block px-8 py-3 bg-[#050315] text-[#00f0ff] font-heading uppercase tracking-wider text-lg hover:bg-[#050315]/90 transition-colors"
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}

