import {
  Vector,
  Op,
  UnOp,
  BinOp,
  Associativity as Assoc,
  Precedence as Prec,
  Fixity as Fix,
} from "./Types";

export const prec: Record<Op, Prec> = {
  "=": 0,
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "u+": 3,
  "u-": 3,
  "^": 4,
  "**": 4,
};

export const assoc: Record<Op, Assoc> = {
  "+": "left",
  "u+": "right",
  "-": "left",
  "u-": "right",
  "*": "left",
  "/": "left",
  "^": "right",
  "**": "right",
  "=": "left",
};

export const fixity: Record<Op, Fix> = {
  "+": "infix",
  "u+": "prefix",
  "-": "infix",
  "u-": "prefix",
  "*": "infix",
  "/": "infix",
  "^": "infix",
  "**": "infix",
  "=": "infix",
};

export function binOp(
  op: BinOp,
  x: number | Vector,
  y: number | Vector
): number | Vector {
  switch (op) {
    case "+":
      if (typeof x === "number") {
        if (typeof y === "number") {
          return x + y;
        } else {
          throw new Error("You can't add a vector to a number");
        }
      } else {
        if (typeof y === "number") {
          throw new Error("You can't add a number to a vector");
        } else {
          if (x.length === y.length) {
            return new Vector(...x.map((xi, i) => xi + y[i]));
          } else {
            throw new Error(
              `You can't add ${JSON.stringify(x)} and ${JSON.stringify(
                y
              )} because they have different lengths.`
            );
          }
        }
      }
    case "-":
      if (typeof x === "number") {
        if (typeof y === "number") {
          return x - y;
        } else {
          throw new Error("You can't subtract a vector from a number");
        }
      } else {
        if (typeof y === "number") {
          throw new Error("You can't subtract a number from a vector");
        } else {
          if (x.length === y.length) {
            return new Vector(...x.map((xi, i) => xi - y[i]));
          } else {
            throw new Error(
              `You can't subtract ${JSON.stringify(y)} from ${JSON.stringify(
                x
              )} because they have different lengths.`
            );
          }
        }
      }
    case "*":
      if (typeof x === "number") {
        if (typeof y === "number") {
          return x * y;
        } else {
          return new Vector(...y.map((yi, i) => x * y[i]));
        }
      } else {
        if (typeof y === "number") {
          return new Vector(...x.map((xi, i) => y * x[i]));
        } else {
          throw new Error(`You can't multiply vectors.`);
        }
      }
    case "/":
      if (typeof x === "number") {
        if (typeof y === "number") {
          return x / y;
        } else {
          throw new Error(`You can't divide by a vector.`);
        }
      } else {
        if (typeof y === "number") {
          return new Vector(...x.map((xi, i) => x[i] / y));
        } else {
          throw new Error(`You can't divide vectors.`);
        }
      }
    case "^":
    case "**":
      if (typeof x === "number") {
        if (typeof y === "number") {
          return Math.pow(x, y);
        } else {
          throw new Error(`You raise a number to a vector power.`);
        }
      } else {
        if (typeof y === "number") {
          throw new Error("You can't raise a vector to a power.");
        } else {
          throw new Error(`You can't raise a vector to a vector power.`);
        }
      }
    case "=":
      if (typeof x === "number") {
        if (typeof y === "number") {
          return Math.abs(x - y) < 1e-8 ? 1 : 0;
        } else {
          throw new Error("Incompatible types.");
        }
      } else {
        if (typeof y === "number") {
          throw new Error("Incompatible types.");
        } else {
          if (x.length === y.length) {
            return new Vector(
              ...x.map((xi, i) => (Math.abs(xi - y[i]) < 1e-8 ? 1 : 0))
            );
          } else {
            throw new Error(`Incompatible sizes.`);
          }
        }
      }

    default:
      throw new Error(`Unknown binary operation: ${op}`);
  }
}

export function unOp(op: UnOp, x: number | Vector): number | Vector {
  switch (op) {
    case "u+":
      return x;
    case "u-":
      return typeof x === "number" ? -x : new Vector(...x.map((xi) => -xi));
    default:
      throw new Error(`Unknown binary operation: ${op}`);
  }
}

export function isUnOp(s: string): s is UnOp {
  return s === "u+" || s === "u-";
}

export function isBinOp(c: string): c is BinOp {
  return (
    c === "+" ||
    c === "-" ||
    c === "*" ||
    c === "/" ||
    c === "^" ||
    c === "**" ||
    c === "="
  );
}
