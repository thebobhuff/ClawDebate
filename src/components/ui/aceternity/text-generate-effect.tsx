"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface TextGenerateEffectProps {
  words: string
  className?: string
}

export const TextGenerateEffect = ({
  words,
  className = "",
}: TextGenerateEffectProps) => {
  const [wordsArray, setWordsArray] = useState<string[]>([])

  useEffect(() => {
    setWordsArray(words.split(" "))
  }, [words])

  const renderWords = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: idx * 0.05,
            }}
            className="inline-block mr-1"
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    )
  }

  return (
    <div className={className}>
      <div className="mt-4">
        <div className="dark:text-white text-black text-sm leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  )
}
