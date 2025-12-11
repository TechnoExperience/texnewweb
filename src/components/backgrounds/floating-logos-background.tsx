/**
 * Floating Logos Background Component
 * Creates an animated background with floating logos that move like in water
 * and collide with each other
 */

import { useEffect, useRef } from "react"

interface Logo {
  id: number
  text: string
  x: number
  y: number
  vx: number
  vy: number
  targetVx: number
  targetVy: number
  size: number
  rotation: number
  rotationSpeed: number
  targetRotationSpeed: number
  color: string
  strokeColor: string
  opacity: number
  waveOffset: number
  fontFamily: string
}

interface FloatingLogosBackgroundProps {
  logoText?: string
  count?: number
}

export function FloatingLogosBackground({ 
  logoText = "TECHNO EXPERIENCE",
  count = 60 // Mayor cantidad de logos llenando todo el hero
}: FloatingLogosBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logosRef = useRef<Logo[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Blue color variations only (más visibles)
    const blueColors = [
      { fill: "#00F9FF", stroke: "#000000", opacity: 0.85 }, // Cyan bright
      { fill: "#00D9E6", stroke: "#000000", opacity: 0.85 }, // Cyan medium
      { fill: "#00CED1", stroke: "#000000", opacity: 0.85 }, // Dark turquoise
      { fill: "#1E90FF", stroke: "#000000", opacity: 0.85 }, // Dodger blue
      { fill: "#4169E1", stroke: "#000000", opacity: 0.85 }, // Royal blue
      { fill: "#0000FF", stroke: "#FFFFFF", opacity: 0.95 }, // Pure blue with white outline
      { fill: "#0000CD", stroke: "#FFFFFF", opacity: 0.95 }, // Medium blue with white outline
      { fill: "#191970", stroke: "#FFFFFF", opacity: 0.95 }, // Midnight blue with white outline
      { fill: "#4682B4", stroke: "#000000", opacity: 0.85 }, // Steel blue
      { fill: "#5F9EA0", stroke: "#000000", opacity: 0.85 }, // Cadet blue
      { fill: "#87CEEB", stroke: "#000000", opacity: 0.85 }, // Sky blue
      { fill: "#B0E0E6", stroke: "#000000", opacity: 0.85 }, // Powder blue
    ]

    // Different font families for variety
    const fontFamilies = [
      "'Bebas Neue', system-ui, sans-serif", // Bold, condensed
      "'Arial Black', sans-serif", // Heavy
      "'Impact', sans-serif", // Bold, wide
      "'Oswald', sans-serif", // Condensed
      "'Roboto Condensed', sans-serif", // Narrow
      "'Montserrat', sans-serif", // Modern
      "'Raleway', sans-serif", // Elegant
      "'Poppins', sans-serif", // Geometric
      "'Futura', sans-serif", // Modern geometric
      "'Helvetica Neue', sans-serif", // Clean
    ]

    // Initialize logos (lluvia de logos que caen desde arriba, con peso)
    const initLogos = () => {
      logosRef.current = []
      for (let i = 0; i < count; i++) {
        const colorIndex = Math.floor(Math.random() * blueColors.length)
        const color = blueColors[colorIndex]
        const fontIndex = Math.floor(Math.random() * fontFamilies.length)
        const fontFamily = fontFamilies[fontIndex]
        const size = 20 + Math.random() * 50 // 20-70px para que quepan más logos
        
        logosRef.current.push({
          id: i,
          text: logoText,
          // Posición inicial: TODOS empiezan desde arriba (fuera de la pantalla)
          x: Math.random() * canvas.width,
          y: -Math.random() * canvas.height * 2 - 100, // Todos empiezan arriba, fuera de la vista
          // Movimiento: todos caen desde arriba al principio - MÁS RÁPIDO
          vx: (Math.random() - 0.5) * 0.5,
          vy: 3.0 + Math.random() * 4.0, // Caen más rápido (velocidad aumentada)
          targetVx: 0,
          targetVy: 0,
          size: size,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          targetRotationSpeed: 0,
          color: color.fill,
          strokeColor: color.stroke,
          opacity: color.opacity,
          waveOffset: Math.random() * Math.PI * 2,
          fontFamily: fontFamily,
        })
      }
    }

    initLogos()

    // Mouse interaction: repulsión desde el puntero (throttled para mejor rendimiento)
    let mouseThrottle = 0
    const handlePointerMove = (event: PointerEvent) => {
      mouseThrottle++
      if (mouseThrottle % 2 !== 0) return // Throttle a 30fps para mouse
      
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      }
    }

    const handlePointerLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerleave", handlePointerLeave)

    // Update logo positions (modo lluvia + reposo) - OPTIMIZADO
    const updateLogos = () => {
      const logos = logosRef.current
      const lerpFactor = 0.15 // Más rápido = menos cálculos
      const velocityDamping = 0.98
      const gravity = 0.3 // Gravedad aumentada para caer más rápido
      const maxSpeed = 12 // Velocidad máxima aumentada
      const maxSpeedSq = maxSpeed * maxSpeed // Pre-calculado para evitar sqrt
      
      // Pre-calcular valores del mouse una sola vez
      const mouseActive = mouseRef.current.active
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      
      // Colisiones simples entre logos
      for (let i = 0; i < logos.length; i++) {
        const logo = logos[i]
        
        // Gravedad hacia abajo: sensación de peso (solo para logos que caen)
        if (logo.vy > 0 && logo.vy < maxSpeed) {
          logo.vy += gravity // Gravedad aumentada para caer más rápido
        }

        // Interacción suave con el ratón (optimizado)
        if (mouseActive) {
          const dx = logo.x - mx
          const dy = logo.y - my
          const distSq = dx * dx + dy * dy
          const influenceRadius = logo.size * 3.5
          const influenceRadiusSq = influenceRadius * influenceRadius

          if (distSq < influenceRadiusSq) {
            const dist = Math.sqrt(distSq) || 0.0001
            const strength = (influenceRadius - dist) / influenceRadius
            const push = 1.5 * strength
            logo.targetVx += (dx / dist) * push
            logo.targetVy += (dy / dist) * push
            logo.targetRotationSpeed += (Math.random() - 0.5) * 0.08 * strength
          }
        }

        // Colisiones simples entre logos
        for (let j = i + 1; j < logos.length; j++) {
            const otherLogo = logos[j]
            const dx = logo.x - otherLogo.x
            const dy = logo.y - otherLogo.y
            const distSq = dx * dx + dy * dy
            const minDist = (logo.size + otherLogo.size) * 0.6
            const minDistSq = minDist * minDist

            if (distSq < minDistSq && distSq > 0) {
            const dist = Math.sqrt(distSq) || 0.0001
            const overlap = minDist - dist
            const separationX = (dx / dist) * overlap * 0.5
            const separationY = (dy / dist) * overlap * 0.5

            // Separar logos
            logo.x += separationX
            logo.y += separationY
            otherLogo.x -= separationX
            otherLogo.y -= separationY

            // Aplicar fuerzas de rebote
            const relativeVx = logo.vx - otherLogo.vx
            const relativeVy = logo.vy - otherLogo.vy
            const dotProduct = relativeVx * (dx / dist) + relativeVy * (dy / dist)
            
            if (dotProduct < 0) {
              const bounce = 0.3
              logo.targetVx -= (dx / dist) * dotProduct * bounce
              logo.targetVy -= (dy / dist) * dotProduct * bounce
              otherLogo.targetVx += (dx / dist) * dotProduct * bounce
              otherLogo.targetVy += (dy / dist) * dotProduct * bounce
            }
          }
        }

        // Interpolación suave hacia la velocidad objetivo
        logo.vx += (logo.targetVx - logo.vx) * lerpFactor
        logo.vy += (logo.targetVy - logo.vy) * lerpFactor
        
        // Freno suave
        logo.vx *= velocityDamping
        logo.vy *= velocityDamping
        logo.targetVx *= 0.999
        logo.targetVy *= 0.999

        // Limitar velocidad máxima (usando distSq para evitar sqrt)
        const speedSq = logo.vx * logo.vx + logo.vy * logo.vy
        if (speedSq > maxSpeedSq) {
          const scale = maxSpeed / Math.sqrt(speedSq)
          logo.vx *= scale
          logo.vy *= scale
        }

        // Actualizar posición
        logo.x += logo.vx
        logo.y += logo.vy

        // Rebote suave en paredes laterales
        const halfSize = logo.size * 0.5
        if (logo.x < halfSize) {
          logo.targetVx = Math.abs(logo.targetVx) * 0.3
          logo.x = halfSize
        } else if (logo.x > canvas.width - halfSize) {
          logo.targetVx = -Math.abs(logo.targetVx) * 0.3
          logo.x = canvas.width - halfSize
        }
        
        // Suelo: que se queden prácticamente en reposo al llegar abajo
        const floorY = canvas.height - logo.size * 0.6
        if (logo.y > floorY) {
          logo.y = floorY
          if (Math.abs(logo.vy) > 0.4) {
            logo.vy = -logo.vy * 0.25
          } else {
            logo.vy = 0
            logo.targetVy = 0
          }
        }

        // Rotación: que vaya quedando casi fija cuando llegan al suelo
        logo.rotationSpeed += (logo.targetRotationSpeed - logo.rotationSpeed) * lerpFactor
        logo.rotationSpeed *= 0.97
        logo.rotation += logo.rotationSpeed
      }
    }

    // Draw logos - OPTIMIZADO (sin shadow blur que es muy costoso)
    const drawLogos = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const logos = logosRef.current
      const rotationRad = Math.PI / 180 // Pre-calculado
      let currentFont = ""
      
      // Dibujar todos los logos, agrupando cambios de fuente
      for (let i = 0; i < logos.length; i++) {
        const logo = logos[i]
        
        // Solo cambiar fuente si es diferente
        if (logo.fontFamily !== currentFont) {
          ctx.font = `bold ${logo.size}px ${logo.fontFamily}`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          currentFont = logo.fontFamily
        }
        
        ctx.save()

        // Move to logo position
        ctx.translate(logo.x, logo.y)
        ctx.rotate(logo.rotation * rotationRad)

        // Draw outline (stroke)
        ctx.strokeStyle = logo.strokeColor
        ctx.lineWidth = Math.max(2, logo.size / 20)
        ctx.strokeText(logo.text, 0, 0)

        // Draw fill (sin glow para mejor rendimiento)
        ctx.fillStyle = logo.color
        ctx.globalAlpha = logo.opacity
        ctx.fillText(logo.text, 0, 0)

        ctx.restore()
      }
    }

    // Animation loop ULTRA OPTIMIZADO - Adaptive FPS
    let lastTime = 0
    const targetFPS = 60
    const frameInterval = 1000 / targetFPS
    let frameCount = 0
    let lastFPSUpdate = 0
    let currentFPS = 60
    let skipFrames = 1
    
    const animate = (currentTime: number) => {
      frameCount++
      
      // Calcular FPS cada segundo y ajustar frame skipping
      if (currentTime - lastFPSUpdate >= 1000) {
        currentFPS = frameCount
        frameCount = 0
        lastFPSUpdate = currentTime
        
        // Adaptive frame skipping basado en FPS real
        if (currentFPS < 30) skipFrames = 3
        else if (currentFPS < 45) skipFrames = 2
        else if (currentFPS < 55) skipFrames = 1
        else skipFrames = 1
      }
      
      // Frame skipping adaptativo
      if (currentTime - lastTime >= frameInterval * skipFrames) {
        updateLogos()
        drawLogos()
        lastTime = currentTime
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [logoText, count])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ willChange: 'transform', imageRendering: 'auto' as const }}
    />
  )
}

