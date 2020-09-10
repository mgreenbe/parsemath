import { Op, UnOp, BinOp, Associativity, Precedence, Fixity } from "./Types";

export const prec: Record<Op, Precedence> = {
  "+": 0,
  "u+": 1,
  "-": 0,
  "u-": 1,
  "*": 2,
  "/": 2,
  "^": 3,
  "**": 3,
};

export const assoc: Record<Op, Associativity> = {
  "+": "left",
  "u+": "right",
  "-": "left",
  "u-": "right",
  "*": "left",
  "/": "left",
  "^": "right",
  "**": "right",
};

export const fixity: Record<Op, Fixity> = {
  "+": "infix",
  "u+": "prefix",
  "-": "infix",
  "u-": "prefix",
  "*": "infix",
  "/": "infix",
  "^": "infix",
  "**": "infix",
};

export function binOp(op: BinOp, x: number, y: number): number {
  switch (op) {
    case "+":
      return x + y;
    case "-":
      return x - y;
    case "*":
      return x * y;
    case "/":
      return x / y;
    case "^":
    case "**":
      return Math.pow(x, y);
    default:
      throw new Error(`Unknown binary operation: ${op}`);
  }
}

export function unOp(op: UnOp, x: number): number {
  switch (op) {
    case "u+":
      return x;
    case "u-":
      return -x;
    default:
      throw new Error(`Unknown binary operation: ${op}`);
  }
}

//   if (typeof x !== "number" || typeof y !== "number") {
//     throw new Error(
//       `Binary operation ${op} takes two numeric arguments. Arguments given: ${x}, ${y}.`
//     );
//   }

//   if (typeof x !== "number") {
//     throw new Error(
//       `Unary operation ${op} takes a numeric argument. Argument given: ${x}.`
//     );
//   }
