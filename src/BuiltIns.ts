import { Vector, univBinOps, univUnOps } from "./Vector";

export type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=" | ",";

export const opData = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: univBinOps["="],
  },
  "+": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: univBinOps["+"],
  },
  "-": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: univBinOps["-"],
  },
  "*": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: univBinOps["*"],
  },
  "/": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: univBinOps["/"],
  },
  "u+": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: univUnOps["+"],
  },
  "u-": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: univUnOps["-"],
  },
  //   "**": { arity: 2, prec: 4, fixity: "INFIX", assoc: "RTL" },
  "^": {
    arity: 2,
    prec: 4,
    fixity: "INFIX",
    assoc: "RTL",
    apply: univBinOps["^"],
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
