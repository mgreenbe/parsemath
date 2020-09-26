import Matrix from "mattrix";

export type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=" | "," | ";";

interface OpRec {
  apply: (...Xs: Matrix[]) => Matrix;
  [key: string]: any;
}
export const opData: Record<string, OpRec> = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.equals,
  },
  "+": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.plus,
  },
  "-": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.minus,
  },
  "*": {
    arity: 2,
    prec: 3,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.times,
  },
  "/": {
    arity: 2,
    prec: 3,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.divide,
  },
  "u+": {
    arity: 1,
    prec: 4,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: (X: Matrix) => X,
  },
  "u-": {
    arity: 1,
    prec: 4,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: Matrix.neg,
  },
  "^": {
    arity: 2,
    prec: 5,
    fixity: "INFIX",
    assoc: "RTL",
    apply: Matrix.pow,
  },
  ",": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.hJoin,
  },
  ";": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: Matrix.vJoin,
  },
};
