import { Vector } from "./Vector";

export type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=" | ",";

export const opData = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: map((x: number, y: number) => (Math.abs(x - y) < 1e-8 ? 1 : 0)),
  },
  "+": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: map((x: number, y: number) => x + y),
  },
  "-": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: map((x: number, y: number) => x - y),
  },
  "*": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: map((x: number, y: number) => x * y),
  },
  "/": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: map((x: number, y: number) => x / y),
  },
  "u+": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: map((x: number) => x),
  },
  "u-": {
    arity: 1,
    prec: 3,
    fixity: "PREFIX",
    assoc: "RTL",
    apply: map((x: number) => -x),
  },
  //   "**": { arity: 2, prec: 4, fixity: "INFIX", assoc: "RTL" },
  "^": {
    arity: 2,
    prec: 4,
    fixity: "INFIX",
    assoc: "RTL",
    apply: map((x: number, y: number) => Math.pow(x, y)),
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

export let builtInFuns: Record<string, FunRec> = {
  abs: {
    nargs: 1,
    apply: map(Math.abs),
  },
  exp: {
    nargs: 1,
    apply: map(Math.exp),
  },
  sqrt: {
    nargs: 1,
    apply: map(Math.sqrt),
  },
  min: {
    nargs: 1,
    apply: map(Math.min),
  },
  max: {
    nargs: 1,
    apply: map(Math.max),
  },
  atan: {
    nargs: 1,
    apply: map(Math.atan),
  },
  atan2: {
    nargs: 2,
    apply: map(Math.atan2),
  },
  dot: {
    nargs: 2,
    apply: dot,
  },
};

type MathFun = (...args: number[]) => number;

export type Fun = (...args: (number | Vector)[]) => number | Vector;
export type FunRec = { nargs: number; apply: Fun };

export function map(f: MathFun): Fun {
  return (...args: (number | Vector)[]) => {
    if (isArrayOfNumbers(args)) {
      return f(...args);
    } else {
      let sizes = args
        .filter<Vector>((arg): arg is Vector => arg instanceof Vector)
        .map((v) => v.length);
      let n = sizes[0];
      if (!sizes.every((m) => m === n)) {
        throw new Error(`Arguments have incompatible sizes.`);
      } else {
        let value: number[] = [];
        for (let i = 0; i < n; i++) {
          let newArgs = args.map((arg) =>
            typeof arg === "number" ? arg : arg[i]
          );
          value.push(f(...newArgs));
        }
        return new Vector(...value);
      }
    }
  };
}

function isArrayOfNumbers(a: any[]): a is number[] {
  return a.every((ai) => typeof ai === "number");
}

function dot(x: number | Vector, y: number | Vector) {
  if (typeof x === "number" && typeof y === "number") {
    return x * y;
  } else if (x instanceof Vector && y instanceof Vector) {
    return x.dot(y);
  } else {
    throw new Error("Arguments have incompatible sizes.");
  }
}
