export type Lower =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export function isLower(s: any): s is Lower {
  return (
    typeof s === "string" &&
    s.length === 1 &&
    s.charCodeAt(0) >= 97 &&
    s.charCodeAt(0) < 123
  );
}

type Upper =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export function isUpper(s: any): s is Upper {
  return (
    typeof s === "string" &&
    s.length === 1 &&
    s.charCodeAt(0) >= 65 &&
    s.charCodeAt(0) < 91
  );
}

export type Letter = Lower | Upper;

export function isLetter(s: any): s is Letter {
  return isLower(s) || isUpper(s);
}

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

export type IdentStartChar = Letter | "$" | "_";

export function isIdentStartChar(s: any): s is IdentStartChar {
  return s === "$" || s === "_" || isLetter(s);
}

export type IdentChar = IdentStartChar | Digit;

export function isIdentChar(s: any): s is IdentChar {
  return isIdentStartChar(s) || isDigit(s);
}

export type UnOp = "u+" | "u-";
export type BinOp = "+" | "-" | "*" | "/" | "^" | "**";
export type Op = UnOp | BinOp;
export type Token = number | UnOp | BinOp | "(" | ")" | Ident;

export type Ident = string;

export function isIdent(s: string): s is Ident {
  return (
    typeof s === "string" &&
    isIdentStartChar(s[0]) &&
    Array.from(s.slice(1)).every((c) => isIdentChar(c))
  );
}

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

export type Scope = { [ident: string]: number };
