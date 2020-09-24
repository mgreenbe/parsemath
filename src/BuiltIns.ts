import Matrix from "./Matrix";

export type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=" | "," | ";";

interface OpRec {
  apply: (...Xs: Matrix[]) => Matrix;
  [key: string]: any;
}
export const opData: Record<string, OpRec> = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.equals,
  },
  "+": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.plus,
  },
  "-": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.minus,
  },
  "*": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.times,
  },
  "/": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.divide,
  },
  "u+": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: (X: Matrix) => X,
  },
  "u-": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: Matrix.neg,
  },
  "^": {
    arity: 2,
    prec: 4,
    fixity: "INFIX",
    assoc: "RTL",
    apply: Matrix.pow,
  },
  ",": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.hJoin,
  },
  ";": {
    arity: 2,
    prec: -1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.vJoin,
  },
};

export let builtInFuns: Record<string, FunRec> = {
  abs: {
    nargs: 1,
    apply: Matrix.lift(Math.abs),
  },
  exp: {
    nargs: 1,
    apply: Matrix.lift(Math.exp),
  },
  sqrt: {
    nargs: 1,
    apply: Matrix.lift(Math.sqrt),
  },
  min: {
    nargs: 1,
    apply: Matrix.lift(Math.min),
  },
  max: {
    nargs: 1,
    apply: Matrix.lift(Math.max),
  },
  atan: {
    nargs: 1,
    apply: Matrix.lift(Math.atan),
  },
  atan2: {
    nargs: 2,
    apply: Matrix.lift(Math.atan2),
  },
  dot: {
    nargs: 2,
    apply: Matrix.dot,
  },
};

export type Fun = (...args: Matrix[]) => Matrix;
export type FunRec = { nargs: number; apply: Fun };
