export type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=";

interface OperatorProps {
  arity: 1 | 2;
  prec: number;
  fixity: "PREFIX" | "INFIX" | "POSTFIX";
  assoc: "LTR" | "RTL";
  apply: (...args: number[]) => number;
}

const opData: Record<string, OperatorProps> = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => (Math.abs(x - y) < 1e-8 ? 1 : 0),
  },
  "+": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x + y,
  },
  "-": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x - y,
  },
  "*": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x * y,
  },
  "/": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x / y,
  },
  "u+": { arity: 1, prec: 3, fixity: "PREFIX", assoc: "RTL", apply: (x) => x },
  "u-": { arity: 1, prec: 3, fixity: "PREFIX", assoc: "RTL", apply: (x) => -x },
  //   "**": { arity: 2, prec: 4, fixity: "INFIX", assoc: "RTL" },
  "^": {
    arity: 2,
    prec: 4,
    fixity: "INFIX",
    assoc: "RTL",
    apply: (x, y) => Math.pow(x, y),
  },
};

export default opData;
