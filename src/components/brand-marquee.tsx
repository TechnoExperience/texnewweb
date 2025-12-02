import React from "react"

const ITEMS = [
  "+10 AÑOS DE ESCENA UNDERGROUND",
  "TECHNO EXPERIENCE",
  "FESTIVALES · CLUBS · LABELS · DJS · PROMOTORES",
  "A SUMMER STORY",
  "METRO DANCE CLUB",
  "POLE GROUP",
  "INDUSTRIAL COPERA",
  "CONEXIÓN CLUBBERS · PROMOTORES",
]

export function BrandMarquee() {
  return (
    <div className="w-full border-y border-white/10 bg-black overflow-hidden">
      <div className="relative py-3 md:py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent z-10" />

        <div className="whitespace-nowrap flex gap-10 animate-marquee text-[0.65rem] md:text-xs tracking-[0.2em] uppercase text-zinc-300 font-space">
          {[...ITEMS, ...ITEMS].map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
            >
              <span>{item}</span>
              <span className="w-1 h-1 rounded-full bg-[#00F9FF]" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}


