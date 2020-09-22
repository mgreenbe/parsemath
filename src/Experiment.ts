type NumTok = {
  type: "NUM";
  startPos: number;
  endPos: number;
  value: number;
};
type IdentTok = {
  type: "IDENT";
  startPos: number;
  endPos: number;
  value: string;
};
type LParenTok = {
  type: "LPAREN";
  startPos: number;
  endPos: number;
  value: "(";
};

type RParenTok = {
  type: "RPAREN";
  startPos: number;
  endPos: number;
  value: ")";
};

type OpTok = {
  type: "OP";
  startPos: number;
  endPos: number;
  value: Op;
};

type Token = NumTok | IdentTok | LParenTok | RParenTok | OpTok;

interface OperatorProps {
  arity: 1 | 2;
  prec: number;
  fixity: "PREFIX" | "INFIX" | "POSTFIX";
  assoc: "LTR" | "RTL";
  apply: (...args: number[]) => number;
}

type Op =
  //   | ","
  "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=";
//   | "**"
//   | "^"
//   | "=="
//   | "<"
//   | ">"
//   | "<="
//   | ">="
//   | "&&"
//   | "||";

const funs: Record<string, (...args: number[]) => number> = {
  exp: Math.exp,
  abs: Math.abs,
  sqrt: Math.sqrt,
  min: Math.min,
  max: Math.max,
};

const opData: Record<Op, OperatorProps> = {
  //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
  "=": {
    arity: 2,
    prec: 0,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => (Math.abs(x - y) < 1e-8 ? 1 : 0),
  },
  "+": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x + y,
  },
  "-": {
    arity: 2,
    prec: 1,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x - y,
  },
  "*": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x * y,
  },
  "/": {
    arity: 2,
    prec: 2,
    fixity: "INFIX",
    assoc: "LTR",
    apply: (x, y) => x / y,
  },
  "u+": { arity: 1, prec: 3, fixity: "PREFIX", assoc: "RTL", apply: (x) => x },
  "u-": { arity: 1, prec: 3, fixity: "PREFIX", assoc: "RTL", apply: (x) => -x },
  //   "**": { arity: 2, prec: 4, fixity: "INFIX", assoc: "RTL" },
  "^": {
    arity: 2,
    prec: 4,
    fixity: "INFIX",
    assoc: "RTL",
    apply: (x, y) => Math.pow(x, y),
  },
};

const lParen = (startPos: number): Token => {
  return { type: "LPAREN", startPos, endPos: startPos + 1, value: "(" };
};
const rParen = (startPos: number): Token => {
  return { type: "RPAREN", startPos, endPos: startPos + 1, value: ")" };
};
const op = (startPos: number, value: Op): Token => {
  return { type: "OP", startPos, endPos: startPos + value.length, value };
};
const num = (startPos: number, endPos: number, value: number): Token => {
  return { type: "NUM", startPos, endPos, value };
};
const ident = (startPos: number, endPos: number, value: string): Token => {
  return { type: "IDENT", startPos, endPos, value };
};

type Mode = "EXPR";

const NUM_RE = /^\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/;
const IDENT_RE = /^[a-zA-Z]\w*/;

export default class Parser {
  tokenStack: TokenStack;
  vars: Record<string, number>;
  funs: Record<string, (x: number) => number>;
  pos: number = 0;
  // tokStack: Token[] = [];
  valStack: number[] = [];
  opStack: (OpTok | LParenTok | IdentTok)[] = [];

  //   mode: Mode = "EXPR";

  constructor(src: string, vars: Record<string, number> = {}) {
    this.tokenStack = new TokenStack(src);
    this.vars = vars;
    this.funs = funs;
  }

  parse(): number {
    let t: Token | undefined;
    while ((t = this.tokenStack.pop())) {
      if (t.type === "NUM") {
        this.valStack.push(t.value);
      } else if (t.type === "IDENT") {
        let value = this.vars[t.value];
        if (value !== undefined) {
          this.valStack.push(value);
        } else {
          let f = funs[t.value];
          if (f !== undefined) {
            let tt = this.tokenStack.pop();
            if (tt === undefined) {
              throw new Error(`Unexpected end of input.`);
            } else if (tt.type !== "LPAREN") {
              throw new Error(`Expected argument list.`);
            } else {
              this.opStack.push(t);
              this.tokenStack.push(tt);
            }
          }
        }
      } else if (t.type === "LPAREN") {
        this.opStack.push(t);
      } else if (t.type === "RPAREN") {
        let op: OpTok | LParenTok | IdentTok | undefined;
        let foundLParen = false;
        while ((op = this.opStack.pop())) {
          if (op.type === "LPAREN") {
            foundLParen = true;
            break;
          } else if (op.type === "IDENT") {
            let f = funs[op.value];
            if (f === undefined) {
              throw new Error(`Unknown function: ${op.value}`);
            } else {
              let arg = this.valStack.pop();
              if (arg === undefined) {
                throw new Error(`Argument expected.`);
              } else {
                this.valStack.push(f(arg));
              }
            }
          } else {
            this.applyOp(op);
          }
        }
        if (!foundLParen) {
          throw new Error(`Unmatched ")"`);
        }
      } else if (t.type === "OP") {
        let topOp = this.opStack.pop();
        if (topOp === undefined) {
          this.opStack.push(t);
        } else if (topOp.type === "LPAREN") {
          this.opStack.push(topOp, t);
        } else if (topOp.type === "IDENT") {
          let f = funs[topOp.value];
          if (f === undefined) {
            throw new Error(`Unknown function: ${topOp.value}`);
          } else {
            let arg = this.valStack.pop();
            if (arg === undefined) {
              throw new Error(`Argument expected.`);
            } else {
              this.valStack.push(f(arg));
              this.tokenStack.push(t);
            }
          }
        } else if (
          opData[t.value].prec > opData[topOp.value].prec ||
          (opData[t.value].arity === 1 && opData[topOp.value].arity === 2)
        ) {
          this.opStack.push(topOp, t);
        } else if (opData[t.value].prec < opData[topOp.value].prec) {
          this.tokenStack.push(t);
          this.applyOp(topOp);
        } else {
          // equal precedence
          if (opData[t.value].assoc !== opData[topOp.value].assoc) {
            throw new Error(
              `All operators with the same precedence must have the same associativity.`
            );
          } else if (opData[t.value].assoc === "RTL") {
            this.opStack.push(topOp, t);
          } else {
            this.tokenStack.push(t);
            this.applyOp(topOp);
          }
        }
      }
      // this.lastTok = t;
      console.log(
        this.valStack,
        `[${this.opStack.map((x) => x.value).join(", ")}]`
      );
    }
    // Apply all remaining ops.
    console.log("\n\n");
    let op: OpTok | LParenTok | IdentTok | undefined;
    while ((op = this.opStack.pop())) {
      if (op.type === "LPAREN") {
        throw new Error(`Unmatched "(".`);
      } else if (op.type === "IDENT") {
        let f = funs[op.value];
        if (f === undefined) {
          throw new Error(`Unknown function: ${op.value}`);
        } else {
          let arg = this.valStack.pop();
          if (arg === undefined) {
            throw new Error(`Argument expected.`);
          } else {
            this.valStack.push(f(arg));
          }
        }
      } else {
        this.applyOp(op);
      }
      console.log(this.valStack, this.opStack.map((x) => x.value).join(", "));
    }
    // Check no values left over.
    if (this.valStack.length === 1) {
      return this.valStack[0];
    } else {
      throw new Error("Unspecified parsing error!");
    }
  }

  applyOp(op: OpTok): void {
    let args = [];
    for (let i = 0; i < opData[op.value].arity; i++) {
      let arg = this.valStack.pop();
      if (arg === undefined) {
        throw new Error(`Insufficient arguments for ${op}.`);
      }
      args.push(arg);
    }
    this.valStack.push(opData[op.value].apply(...args.reverse()));
  }

  // getToken(): Token | undefined {
  //   if (this.tokStack.length > 0) {
  //     return this.tokStack.pop();
  //   }
  //   this.skipWhitespace();
  //   let ch = this.src[this.pos];
  //   if (ch === undefined) {
  //     return undefined;
  //   } else if (ch === "(") {
  //     return lParen(this.pos++);
  //   } else if (ch === ")") {
  //     return rParen(this.pos++);
  //   } else if (ch === "*" || ch === "/" || ch === "^" || ch === "=") {
  //     return op(this.pos++, ch);
  //   } else if (ch === "+" || ch === "-") {
  //     if (
  //       this.lastTok === undefined ||
  //       this.lastTok.type === "LPAREN" ||
  //       this.lastTok.type === "OP"
  //     ) {
  //       return op(this.pos++, ch === "+" ? "u+" : "u-");
  //     } else {
  //       return op(this.pos++, ch);
  //     }
  //   } else if ("0123456789".includes(ch)) {
  //     let match = NUM_RE.exec(this.src.slice(this.pos));
  //     if (match === null) {
  //       throw new Error("This shouldn't have happened!");
  //     }
  //     let startPos = this.pos;
  //     this.pos += match[0].length;
  //     return num(startPos, this.pos, Number(match[0]));
  //   } else if (
  //     (ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) < 91) ||
  //     (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) < 123)
  //   ) {
  //     let match = IDENT_RE.exec(this.src.slice(this.pos));
  //     if (match === null) {
  //       throw new Error("This shouldn't have happened!");
  //     }
  //     let startPos = this.pos;
  //     this.pos += match[0].length;
  //     return ident(startPos, this.pos, match[0]);
  //   } else {
  //     throw new Error(`Uexpected character: ${ch}`);
  //   }
  // }

  // skipWhitespace(): void {
  //   while (this.src[this.pos]?.trim() === "") {
  //     this.pos++;
  //   }
  // }
}

class TokenStack {
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
    console.log(`ch=${ch}, pos=${this.pos}`);
    if (ch === undefined) {
      this.cur = undefined;
      return this.cur;
    } else if (ch === "(") {
      this.cur = lParen(this.pos++);
      return this.cur;
    } else if (ch === ")") {
      this.cur = rParen(this.pos++);
      return this.cur;
    } else if (ch === "*" || ch === "/" || ch === "^" || ch === "=") {
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
      this.cur = num(startPos, this.pos, Number(match[0]));
      return this.cur;
    } else if (
      (ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) < 91) ||
      (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) < 123)
    ) {
      let match = IDENT_RE.exec(this.src.slice(this.pos));
      if (match === null) {
        throw new Error("This shouldn't have happened!");
      }
      let startPos = this.pos;
      this.pos += match[0].length;
      this.cur = ident(startPos, this.pos, match[0]);
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

// let T = new TokenStack("2.+0.3*4e2");

// for (let i = 0; i < 7; i++) {
//   let t = T.pop();
//   console.log(t);
// }
let P = new Parser("2.+0.3*4e2");
console.log(P.parse());
// let t: Token | undefined;
// while ((t = P.getToken())) {
//   console.log(t);
// }
