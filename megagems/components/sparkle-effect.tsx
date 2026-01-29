'use client'

import { useMemo } from 'react'

interface Sparkle {
  id: number
  x: number
  y: number
  delay: number
  size: number
}

function generateSparkles(): Sparkle[] {
  const sparkles: Sparkle[] = []
  for (let i = 0; i < 30; i++) {
    sparkles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 3 + 2,
    })
  }
  return sparkles
}

export function SparkleEffect() {
  const sparkles = useMemo(() => generateSparkles(), [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
