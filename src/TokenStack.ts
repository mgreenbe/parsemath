import { Op, opData } from "./BuiltIns";

export type Token = NumTok | FunTok | LParenTok | RParenTok | OpTok;

export type NumTok = {
  type: "NUM";
  startPos: number;
  value: number;
};

export type FunTok = {
  type: "FUN";
  startPos: number;
  name: string;
  apply: (...args: number[]) => number;
};

export type LParenTok = {
  type: "LPAREN";
  startPos: number;
};

export type RParenTok = {
  type: "RPAREN";
  startPos: number;
};

export type OpTok = {
  type: "OP";
  startPos: number;
  name: Op;
};

const lParen = (startPos: number): Token => {
  return { type: "LPAREN", startPos };
};
const rParen = (startPos: number): Token => {
  return { type: "RPAREN", startPos };
};
const op = (startPos: number, op: Op): Token => {
  return { type: "OP", startPos, name: op };
};
const num = (startPos: number, value: number): Token => {
  return { type: "NUM", startPos, value };
};
const fun = (
  startPos: number,
  name: string,
  apply: (...args: number[]) => number
): Token => {
  return { type: "FUN", startPos, name, apply };
};

const NUM_RE = /^\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/;
const IDENT_RE = /^([a-zA-Z]\w*)\s*(\(?)/;

export default class TokenStack {
  src: string;
  vars: Record<string, number>;
  funs: Record<string, (...args: number[]) => number>;
  pos: number = 0;
  buf: Token[] = [];
  cur: Token | undefined = undefined;
  last: Token | undefined = undefined;

  constructor(
    src: string,
    vars: Record<string, number>,
    funs: Record<string, (...args: number[]) => number>
  ) {
    this.src = src;
    this.vars = vars;
    this.funs = funs;
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
    } else if (ch === ")") {
      if (!this.last) {
        throw new Error(`Expression starts with ')'`);
      } else if (this.last.type === "LPAREN") {
        throw new Error(`Empty parentheses.`);
      }
      this.cur = rParen(this.pos++);
      return this.cur;
    } else if (
      ch === "*" ||
      ch === "/" ||
      ch === "^" ||
      ch === "=" ||
      ch === ","
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
      this.cur = num(startPos, Number(match[0]));
      return this.cur;
    } else if (
      (ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) < 91) ||
      (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) < 123)
    ) {
      let match = IDENT_RE.exec(this.src.slice(this.pos));
      if (!match || !match[1]) {
        throw new Error("This shouldn't have happened!");
      }
      let ident = match[1];
      let startPos = this.pos;
      this.pos += ident.length;
      if (match[2]) {
        let f = this.funs[ident];
        if (f === undefined) {
          throw new Error(`Unknown function '${ident}'`);
        } else {
          this.cur = fun(startPos, ident, f);
        }
      } else {
        let value = this.vars[ident];
        if (value !== undefined) {
          this.cur = num(startPos, value);
        } else {
          throw new Error(`Unknown variable '${value}'`);
        }
      }
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
