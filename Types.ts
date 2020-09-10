export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export function isDigit(c: any): c is Digit {
  return (
    c === "0" ||
    c === "1" ||
    c === "2" ||
    c === "3" ||
    c === "4" ||
    c === "5" ||
    c === "6" ||
    c === "7" ||
    c === "8" ||
    c === "9"
  );
}

export type UnOp = "u+" | "u-";
export type BinOp = "+" | "-" | "*" | "/" | "^" | "**";
export type Op = UnOp | BinOp;
export type Token = number | UnOp | BinOp | "(" | ")";

export function isNum(t: any): t is number {
  return typeof t === "number";
}

export function isUnOp(t: any): t is UnOp {
  return t === "u+" || t === "u-";
}

export function isBinOp(t: any): t is BinOp {
  return (
    t === "+" || t === "-" || t === "*" || t === "/" || t === "^" || t === "**"
  );
}

export function isOp(t: any): t is Op {
  return isUnOp(t) || isBinOp(t);
}

export type Precedence = 0 | 1 | 2 | 3;
export type Associativity = "left" | "right";
export type Arity = 1 | 2;
export type Fixity = "prefix" | "infix";
