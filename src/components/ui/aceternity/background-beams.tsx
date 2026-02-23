"use client"

import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export const BackgroundBeams = ({
  className = "",
}: {
  className?: string
}) => {
  const beamsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const beams = beamsRef.current
    if (!beams) return

    const createBeam = () => {
      const beam = document.createElement("div")
      beam.className = "beam"
      beam.style.left = `${Math.random() * 100}%`
      beam.style.animationDuration = `${Math.random() * 2 + 1}s`
      beams.appendChild(beam)

      setTimeout(() => {
        beam.remove()
      }, 3000)
    }

    const interval = setInterval(createBeam, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={beamsRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <style jsx>{`
        .beam {
          position: absolute;
          top: -100%;
          width: 2px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(59, 130, 246, 0.3),
            transparent
          );
          animation: beam 2s linear;
        }

        @keyframes beam {
          0% {
            top: -100%;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  )
}
