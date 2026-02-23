"use client"

import React from "react"
import { motion } from "framer-motion"

interface MeteorEffectProps {
  number?: number
  className?: string
}

export const MeteorEffect = ({
  number = 20,
  className = "",
}: MeteorEffectProps) => {
  const meteors = new Array(number).fill(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {meteors.map((_, idx) => (
        <motion.span
          key={idx}
          className="absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_4px_2px_rgba(148,163,184,0.7)]"
          style={{
            top: Math.floor(Math.random() * 400) + "px",
            left: Math.floor(Math.random() * 400) + "px",
            transform: "rotate(215deg)",
          }}
          animate={{
            translateX: "0px",
            translateY: "0px",
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            repeatDelay: Math.random() * 2000,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
