'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Floating "back to top" control — appears after the user scrolls past the
 * hero and returns them to the top smoothly. Purely progressive enhancement.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-sky-200/60 bg-white/90 text-primary shadow-lg shadow-sky-900/10 backdrop-blur transition-colors hover:bg-white dark:border-sky-400/30 dark:bg-[#0b1f3f]/90 dark:text-sky-300 dark:hover:bg-[#0b1f3f]"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
