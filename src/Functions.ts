import Matrix from "mattrix";

export type Fun = (...args: Matrix[]) => Matrix;
export type FunRec = { nargs: number; apply: Fun };

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
  cos: {
    nargs: 1,
    apply: Matrix.lift(Math.cos),
  },
  sin: {
    nargs: 1,
    apply: Matrix.lift(Math.sin),
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
