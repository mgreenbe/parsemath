export type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=" | ",";

export const opData = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x: number, y: number) => (Math.abs(x - y) < 1e-8 ? 1 : 0),
  },
  "+": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x: number, y: number) => x + y,
  },
  "-": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x: number, y: number) => x - y,
  },
  "*": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x: number, y: number) => x * y,
  },
  "/": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x: number, y: number) => x / y,
  },
  "u+": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: (x: number) => x,
  },
  "u-": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: (x: number) => -x,
  },
  //   "**": { arity: 2, prec: 4, fixity: "INFIX", assoc: "RTL" },
  "^": {
    arity: 2,
    prec: 4,
    fixity: "INFIX",
    assoc: "RTL",
    apply: (x: number, y: number) => Math.pow(x, y),
  },
  ",": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x: number | number[], y: number) => {
      if (typeof x === "number") {
        return [x, y];
      } else {
        return [...x, y];
      }
    },
  },
};

export const builtInFuns: Record<string, (...args: number[]) => number> = {
  exp: Math.exp,
  abs: Math.abs,
  sqrt: Math.sqrt,
  min: Math.min,
  max: Math.max,
  atan: Math.atan,
  atan2: Math.atan2,
};
