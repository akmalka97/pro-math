import { describe, expect, it } from 'vitest'
import { check } from './equivalent'
import { latexToInfix } from './latex-to-infix'
import { normalize } from './normalize'

describe('equivalent forms', () => {
  it('accepts any form of the same rational', () => {
    for (const student of ['1/2', '0.5', '2/4', '4/8', '.5']) {
      expect(check(student, '1/2', 'rational')).toBe('correct')
    }
  })

  it('accepts an unsimplified fraction', () => {
    expect(check('4/8', '1/2', 'rational')).toBe('correct')
  })
})

describe('non-terminating answers use the 3 s.f. band', () => {
  it('accepts a 3 s.f. decimal for 1/3', () => {
    expect(check('0.333', '1/3', 'rational')).toBe('correct')
    expect(check('0.3333', '1/3', 'rational')).toBe('correct')
    expect(check('1/3', '1/3', 'rational')).toBe('correct')
  })

  it('rejects a 2 s.f. decimal for 1/3', () => {
    expect(check('0.33', '1/3', 'rational')).toBe('incorrect')
  })

  it('accepts 1.41 for sqrt(2)', () => {
    expect(check('1.41', 'sqrt(2)', 'rational')).toBe('correct')
    expect(check('1.4', 'sqrt(2)', 'rational')).toBe('incorrect')
  })
})

describe('exact answers admit no band', () => {
  it('rejects 1198 for 1200', () => {
    expect(check('1198', '1200', 'integer')).toBe('incorrect')
    expect(check('1199.9', '1200', 'integer')).toBe('incorrect')
    expect(check('1200', '1200', 'integer')).toBe('correct')
    expect(check('1200.0', '1200', 'integer')).toBe('correct')
  })

  it('rejects a near miss on a terminating fraction', () => {
    expect(check('0.75', '3/4', 'rational')).toBe('correct')
    expect(check('0.749', '3/4', 'rational')).toBe('incorrect')
  })

  it('treats zero as exact', () => {
    expect(check('0', '0', 'integer')).toBe('correct')
    expect(check('-0', '0', 'integer')).toBe('correct')
    expect(check('0.0', '0', 'integer')).toBe('correct')
    expect(check('0.001', '0', 'integer')).toBe('incorrect')
  })
})

describe('negatives and surds', () => {
  it('accepts equivalent ways of writing -3', () => {
    for (const student of ['-3', '(-3)', '0-3', '−3']) {
      expect(check(student, '-3', 'integer')).toBe('correct')
    }
  })

  it('accepts equivalent surd forms', () => {
    expect(check('2*sqrt(2)', 'sqrt(8)', 'rational')).toBe('correct')
    expect(check('2.83', 'sqrt(8)', 'rational')).toBe('correct')
  })
})

describe('expressions', () => {
  it('accepts an expanded bracket', () => {
    expect(check('2x+6', '2(x+3)', 'expression')).toBe('correct')
    expect(check('6+2x', '2(x+3)', 'expression')).toBe('correct')
  })

  it('rejects a wrong expansion', () => {
    expect(check('2x+3', '2(x+3)', 'expression')).toBe('incorrect')
  })

  it('accepts a reordered product', () => {
    expect(check('x*2', '2x', 'expression')).toBe('correct')
  })

  it('handles two variables', () => {
    expect(check('7x+2y', '3x+2y+4x', 'expression')).toBe('correct')
    expect(check('7x+3y', '3x+2y+4x', 'expression')).toBe('incorrect')
  })

  it('marks a numeric answer wrong for an expression question', () => {
    expect(check('5', '2x+6', 'expression')).toBe('incorrect')
  })
})

describe('sets', () => {
  it('ignores order and duplicates', () => {
    expect(check('18,9,6,3,2,1', '1,2,3,6,9,18', 'set')).toBe('correct')
    expect(check('1, 1, 2, 3, 6, 9, 18', '1,2,3,6,9,18', 'set')).toBe('correct')
    expect(check('{1,2,3,6,9,18}', '1,2,3,6,9,18', 'set')).toBe('correct')
  })

  it('rejects a missing member', () => {
    expect(check('1,2,3,6,9', '1,2,3,6,9,18', 'set')).toBe('incorrect')
  })
})

describe('ratios', () => {
  it('accepts any proportional form', () => {
    expect(check('2:3', '2:3', 'ratio')).toBe('correct')
    expect(check('4:6', '2:3', 'ratio')).toBe('correct')
    expect(check('6 : 9', '2:3', 'ratio')).toBe('correct')
  })

  it('rejects a non-proportional ratio', () => {
    expect(check('2:4', '2:3', 'ratio')).toBe('incorrect')
  })

  it('handles three terms', () => {
    expect(check('4:6:10', '2:3:5', 'ratio')).toBe('correct')
    expect(check('2:3:6', '2:3:5', 'ratio')).toBe('incorrect')
  })
})

describe('unreadable input never counts as wrong', () => {
  for (const student of ['2x+', '', '   ', '??', '1//2']) {
    it(`treats ${JSON.stringify(student)} as unreadable`, () => {
      expect(check(student, '5', 'integer')).toBe('unreadable')
    })
  }
})

describe('normalisation', () => {
  it('accepts unicode operators and superscripts', () => {
    expect(normalize('3 × 4')).toBe('3 * 4')
    expect(normalize('12 ÷ 4')).toBe('12 / 4')
    expect(check('x²', 'x^2', 'expression')).toBe('correct')
    expect(check('√9', '3', 'integer')).toBe('correct')
  })

  it('keeps only the right side when a student restates the equation', () => {
    expect(check('x = 5', '5', 'integer')).toBe('correct')
  })
})

describe('latex to infix', () => {
  const cases: Array<[string, string]> = [
    ['\\frac{1}{2}', '((1)/(2))'],
    ['\\sqrt{9}', 'sqrt(9)'],
    ['\\sqrt[3]{8}', 'nthRoot(8, 3)'],
    ['x^{2}', 'x^(2)'],
    ['2\\times3', '2*3'],
    ['\\left(x+1\\right)', '(x+1)'],
  ]

  for (const [latex, expected] of cases) {
    it(`converts ${latex}`, () => {
      expect(latexToInfix(latex)).toBe(expected)
    })
  }

  it('feeds the checker correctly from mathfield input', () => {
    expect(check('\\frac{1}{2}', '0.5', 'rational', 'mathfield')).toBe('correct')
    expect(check('\\sqrt[3]{8}', '2', 'integer', 'mathfield')).toBe('correct')
    expect(check('2x+6', '2(x+3)', 'expression', 'mathfield')).toBe('correct')
  })
})
