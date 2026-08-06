/**
 * Converts the LaTeX that MathLive emits into infix notation that mathjs parses.
 *
 * This is deliberately narrow: it handles the constructs the Form 1 generators
 * can produce and nothing else. An unrecognised command is left in place so it
 * fails loudly at the parse step rather than silently changing meaning.
 */

const COMMAND_REPLACEMENTS: Record<string, string> = {
  '\\times': '*',
  '\\cdot': '*',
  '\\div': '/',
  '\\pi': 'pi',
  '\\ ': ' ',
  '\\,': ' ',
  '\\;': ' ',
  '\\!': '',
  '\\left': '',
  '\\right': '',
  '\\displaystyle': '',
  '\\mathrm': '',
}

class Scanner {
  constructor(
    private readonly src: string,
    private pos = 0,
  ) {}

  atEnd(): boolean {
    return this.pos >= this.src.length
  }

  peek(): string {
    return this.src[this.pos] ?? ''
  }

  next(): string {
    return this.src[this.pos++] ?? ''
  }

  skipWhitespace(): void {
    while (!this.atEnd() && /\s/.test(this.peek())) this.pos++
  }

  /** Reads `\name`, positioned on the backslash. */
  readCommand(): string {
    const start = this.pos
    this.pos++ // backslash
    if (!/[a-zA-Z]/.test(this.peek())) {
      // Escaped punctuation such as `\,` or `\ `.
      this.pos++
      return this.src.slice(start, this.pos)
    }
    while (!this.atEnd() && /[a-zA-Z]/.test(this.peek())) this.pos++
    return this.src.slice(start, this.pos)
  }

  /**
   * Reads one argument: a braced group, a bracketed group, or a single token.
   * Returns the raw inner LaTeX, which the caller converts recursively.
   */
  readGroup(open = '{', close = '}'): string {
    this.skipWhitespace()
    if (this.peek() !== open) {
      // A bare single token, as in `x^2` or `\sqrt 9`.
      if (this.peek() === '\\') return this.readCommand()
      return this.next()
    }
    this.next() // opening delimiter
    const start = this.pos
    let depth = 1
    while (!this.atEnd() && depth > 0) {
      const ch = this.next()
      if (ch === '\\') {
        this.pos++ // whatever follows a backslash is never a delimiter
        continue
      }
      if (ch === open) depth++
      else if (ch === close) depth--
    }
    return this.src.slice(start, this.pos - 1)
  }

  hasOptionalArg(): boolean {
    this.skipWhitespace()
    return this.peek() === '['
  }
}

function convert(latex: string): string {
  const scanner = new Scanner(latex)
  let out = ''

  while (!scanner.atEnd()) {
    const ch = scanner.peek()

    if (ch === '\\') {
      const command = scanner.readCommand()

      if (command === '\\frac' || command === '\\dfrac' || command === '\\tfrac') {
        const numerator = convert(scanner.readGroup())
        const denominator = convert(scanner.readGroup())
        out += `((${numerator})/(${denominator}))`
        continue
      }

      if (command === '\\sqrt') {
        if (scanner.hasOptionalArg()) {
          const degree = convert(scanner.readGroup('[', ']'))
          const radicand = convert(scanner.readGroup())
          out += `nthRoot(${radicand}, ${degree})`
        } else {
          const radicand = convert(scanner.readGroup())
          out += `sqrt(${radicand})`
        }
        continue
      }

      if (command in COMMAND_REPLACEMENTS) {
        out += COMMAND_REPLACEMENTS[command]
        continue
      }

      // Unknown command: pass it through so mathjs rejects it rather than
      // quietly producing a different expression.
      out += command
      continue
    }

    if (ch === '^' || ch === '_') {
      scanner.next()
      const exponent = convert(scanner.readGroup())
      out += ch === '^' ? `^(${exponent})` : `_(${exponent})`
      continue
    }

    if (ch === '{' || ch === '}') {
      // Grouping braces that are not command arguments become parentheses.
      scanner.next()
      out += ch === '{' ? '(' : ')'
      continue
    }

    out += scanner.next()
  }

  return out
}

export function latexToInfix(latex: string): string {
  return convert(latex).replace(/\s+/g, ' ').trim()
}
