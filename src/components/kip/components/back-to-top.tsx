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
          className="focus-glow fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-white/95 text-primary shadow-lg shadow-brand-900/15 backdrop-blur transition-all hover:border-gold-400 hover:text-gold-600 dark:border-gold-500/30 dark:bg-brand-950/90 dark:text-gold-300 dark:hover:bg-brand-900"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
