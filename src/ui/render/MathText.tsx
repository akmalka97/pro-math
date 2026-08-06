import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useMemo } from 'react'

type Props = {
  latex: string
  className?: string
}

/**
 * Renders generator LaTeX. `displayMode` keeps fractions full height, which is
 * the whole reason for using KaTeX rather than plain text.
 */
export function MathText({ latex, className }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        strict: false,
      })
    } catch {
      // A generator producing invalid LaTeX is a bug, but it must not blank the
      // screen mid-set; showing the source is the least-bad fallback.
      return `<code>${latex}</code>`
    }
  }, [latex])

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
