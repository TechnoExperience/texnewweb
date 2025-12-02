import { Link } from "react-router-dom"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", showText = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  }

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {/* Logo SVG Real */}
      <img
        src="/logo.svg"
        alt="Techno Experience"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </Link>
  )
}

