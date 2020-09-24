import { Op } from "./Operators";
import Matrix from "./Matrix";

export type Token =
  | ValueTok
  | IdentTok
  | OpTok
  | LParenTok
  | RParenTok
  | LBrakTok
  | RBrakTok;

export type ValueTok = {
  type: "VALUE";
  startPos: number;
  value: Matrix;
};
export type IdentTok = {
  type: "IDENT";
  startPos: number;
  name: string;
};
export type OpTok = {
  type: "OP";
  startPos: number;
  name: Op;
};
export type LParenTok = {
  type: "LPAREN";
  startPos: number;
};
export type RParenTok = {
  type: "RPAREN";
  startPos: number;
};
export type LBrakTok = {
  type: "LBRAK";
  startPos: number;
};
export type RBrakTok = {
  type: "RBRAK";
  startPos: number;
};

const op = (startPos: number, op: Op): Token => {
  return { type: "OP", startPos, name: op };
};
const value = (startPos: number, value: Matrix): ValueTok => {
  return { type: "VALUE", startPos, value };
};
const ident = (startPos: number, name: string): IdentTok => {
  return { type: "IDENT", startPos, name };
};
const lParen = (startPos: number): Token => {
  return { type: "LPAREN", startPos };
};
const rParen = (startPos: number): Token => {
  return { type: "RPAREN", startPos };
};
const lBrak = (startPos: number): Token => {
  return { type: "LBRAK", startPos };
};
const rBrak = (startPos: number): Token => {
  return { type: "RBRAK", startPos };
};

const NUM_RE = /^\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/;
const IDENT_RE = /^[a-zA-Z]\w*/;

export default class TokenStack {
  src: string;
  pos: number = 0;
  buf: Token[] = [];
  cur: Token | undefined = undefined;
  last: Token | undefined = undefined;

  constructor(src: string) {
    this.src = src;
  }

  push(t: Token): void {
    this.buf.push(t);
  }

  pop(): Token | undefined {
    if (this.cur) {
      this.last = this.cur;
    }
    if (this.buf.length > 0) {
      this.cur = this.buf.pop();
      return this.cur;
    }
    this.skipWhitespace();
    let ch = this.src[this.pos];
    if (ch === undefined) {
      this.cur = undefined;
      return this.cur;
    } else if (ch === "(") {
      this.cur = lParen(this.pos++);
      return this.cur;
    } else if (ch === "[") {
      this.cur = lBrak(this.pos++);
      return this.cur;
    } else if (ch === ")") {
      if (!this.last) {
        throw new Error(`Expression starts with ')'`);
      }
      this.cur = rParen(this.pos++);
      return this.cur;
    } else if (ch === "]") {
      if (!this.last) {
        throw new Error(`Expression starts with ']'`);
      } else if (this.last.type === "LPAREN") {
        throw new Error(`Empty brackets.`);
      }
      this.cur = rBrak(this.pos++);
      return this.cur;
    } else if (
      ch === "*" ||
      ch === "/" ||
      ch === "^" ||
      ch === "=" ||
      ch === "," ||
      ch === ";"
    ) {
      this.cur = op(this.pos++, ch);
      return this.cur;
    } else if (ch === "+" || ch === "-") {
      if (
        this.last === undefined ||
        this.last.type === "LPAREN" ||
        this.last.type === "OP"
      ) {
        this.cur = op(this.pos++, ch === "+" ? "u+" : "u-");
        return this.cur;
      } else {
        this.cur = op(this.pos++, ch);
        return this.cur;
      }
    } else if ("0123456789".includes(ch)) {
      let match = NUM_RE.exec(this.src.slice(this.pos));
      if (match === null) {
        throw new Error("This shouldn't have happened!");
      }
      let startPos = this.pos;
      this.pos += match[0].length;
      let m = Matrix.fromNumber(Number(match[0]));
      this.cur = value(startPos, m);
      return this.cur;
    } else if (
      (ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) < 91) ||
      (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) < 123)
    ) {
      let match = IDENT_RE.exec(this.src.slice(this.pos));
      if (match === null) {
        throw new Error("This shouldn't have happened!");
      }
      this.cur = ident(this.pos, match[0]);
      this.pos += match[0].length;
      return this.cur;
    } else {
      throw new Error(`Uexpected character: ${ch}`);
    }
  }

  skipWhitespace(): void {
    while (this.src[this.pos]?.trim() === "") {
      this.pos++;
    }
  }
}
