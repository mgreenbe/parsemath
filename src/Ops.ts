import {
  Row,
  Op,
  UnOp,
  BinOp,
  Associativity as Assoc,
  Precedence as Prec,
  Fixity as Fix,
} from './Types'

export const prec: Record<Op, Prec> = {
  '=': 0,
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  'u+': 3,
  'u-': 3,
  '^': 4,
  '**': 4,
}

//

export const assoc: Record<Op, Assoc> = {
  '+': 'left',
  'u+': 'right',
  '-': 'left',
  'u-': 'right',
  '*': 'left',
  '/': 'left',
  '^': 'right',
  '**': 'right',
  '=': 'left',
}
// In Javascript, unary +/- have higher precedence (17) than ** (16).

export const fixity: Record<Op, Fix> = {
  '+': 'infix',
  'u+': 'prefix',
  '-': 'infix',
  'u-': 'prefix',
  '*': 'infix',
  '/': 'infix',
  '^': 'infix',
  '**': 'infix',
  '=': 'infix',
}

export function binOp(
  op: BinOp,
  x: number | Row,
  y: number | Row,
): number | Row {
  switch (op) {
    case '+':
      if (typeof x === 'number') {
        if (typeof y === 'number') {
          return x + y
        } else {
          throw new Error("You can't add a scalar and a vector.")
        }
      } else {
        if (typeof y === 'number') {
          throw new Error("You can't add a scalar and a vector.")
        } else {
          if (x.length !== y.length) {
            throw new Error("You can't add vectors of different lengths.")
          }
          return x.map((xi, i) => xi + y[i])
        }
      }
    case '-':
      if (typeof x === 'number') {
        if (typeof y === 'number') {
          return x - y
        } else {
          throw new Error("You can't subtract a vector from a scalar.")
        }
      } else {
        if (typeof y === 'number') {
          throw new Error("You can't subtract a scalar from a vector.")
        } else {
          if (x.length !== y.length) {
            throw new Error("You can't subtract vectors of different lengths.")
          }
          return x.map((xi, i) => xi - y[i])
        }
      }
    case '*':
      if (typeof x === 'number') {
        if (typeof y === 'number') {
          return x * y
        } else {
          return y.map((yi) => x * yi)
        }
      } else {
        if (typeof y === 'number') {
          return x.map((xi) => xi * y)
        } else {
          y
          throw new Error("You can't multiply two vectors.")
        }
      }
    case '/':
      if (typeof x === 'number') {
        if (typeof y === 'number') {
          return x / y
        } else {
          throw new Error("You can't divide by a number by vector.")
        }
      } else {
        if (typeof y === 'number') {
          return x.map((xi) => xi / y)
        } else {
          throw new Error("You can't divide by a vector by a vector.")
        }
      }
    case '^':
    case '**':
      if (typeof x === 'number') {
        if (typeof y === 'number') {
          return Math.pow(x, y)
        } else {
          throw new Error("You can't raise a number to a vector power.")
        }
      } else {
        if (typeof y === 'number') {
          throw new Error("You can't raise a vector to a scalar.")
        } else {
          throw new Error("You can't raise a vector to a vector.")
        }
      }
    case '=':
      if (typeof x === 'number') {
        if (typeof y === 'number') {
          return Math.abs(x - y) < 1e-8 ? 1 : 0
        } else {
          return 0
        }
      } else {
        if (typeof y === 'number') {
          return 0
        } else {
          if (x.length !== y.length) {
            return 0
          } else {
            return Number(
              x.map((xi, y) => Math.abs(xi - y) < 1e-8).every((t) => t),
            )
          }
        }
      }
    default:
      throw new Error(`Unknown binary operation: ${op}`)
  }
}

export function unOp(op: UnOp, x: number | Row): number | Row {
  switch (op) {
    case 'u+':
      return x
    case 'u-':
      if (typeof x === 'number') {
        return -x
      } else {
        return x.map((xi) => -xi)
      }
    default:
      throw new Error(`Unknown binary operation: ${op}`)
  }
}

export function isUnOp(s: string): s is UnOp {
  return s === 'u+' || s === 'u-'
}

export function isBinOp(c: string): c is BinOp {
  return (
    c === '+' ||
    c === '-' ||
    c === '*' ||
    c === '/' ||
    c === '^' ||
    c === '**' ||
    c === '='
  )
}
