import { motion } from 'framer-motion'

export function ThinkingAnimation() {
  return (
    <div className="flex items-center justify-center h-8">
      <motion.div
        className="w-2 h-2 bg-primary rounded-full mr-1"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.5, 1],
          delay: 0,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full mr-1"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.5, 1],
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          times: [0, 0.5, 1],
          delay: 0.4,
        }}
      />
    </div>
  )
}

