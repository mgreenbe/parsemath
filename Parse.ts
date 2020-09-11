import { Op, OpTok, LParenTok, Scope, Tok } from "./Types";
import { prec, assoc, fixity, unOp, binOp, isUnOp, isBinOp } from "./Ops";

import Tokenizer from "./Tokenize";

export default class Parser {
  s: string;
  scope: Scope;
  ts: Tok[];
  index = 0;
  ops: (OpTok | LParenTok)[] = [];
  vals: number[] = [];

  constructor(s: string, scope: Scope = {}) {
    this.s = s;
    this.scope = scope;
    let allowedIdents = Object.keys(scope);
    let tokenizer = new Tokenizer(s, allowedIdents);
    this.ts = tokenizer.tokenize();
  }

  parse(): number {
    while (this.index < this.ts.length) {
      let t = this.ts[this.index++];
      switch (t[0]) {
        case "Num":
          this.vals.push(t[1]);
          break;
        case "Ident":
          this.vals.push(this.scope[t[1]]);
          break;
        case "LParen":
          this.ops.push(t);
          break;
        case "RParen":
          {
            let op = this.ops.pop();
            if (op === undefined) {
              this.throwError(`Unmatched ')' at ${t[2]}.`, t);
            }
            if (op[0] !== "LParen") {
              this.evalOp(op[1]);
              this.index--;
            }
          }
          break;
        case "UnOp":
        case "BinOp":
          {
            let op = this.ops.pop();
            if (op === undefined) {
              this.ops.push(t);
            } else if (op[0] === "LParen") {
              this.ops.push(op, t);
            } else if (
              prec[t[1]] > prec[op[1]] ||
              (prec[t[1]] === prec[op[1]] && assoc[t[1]] === "right") ||
              (prec[t[1]] <= prec[op[1]] &&
                isUnOp(t[1]) &&
                fixity[t[1]] === "prefix")
            ) {
              this.ops.push(op, t);
            } else {
              this.index--;
              this.evalOp(op[1]);
            }
          }
          break;
        default:
          throw new Error("This shouldn't happen!");
      }
    }
    // All tokens processed.
    // Clear out operation and value stacks.
    let op: OpTok | LParenTok;
    while ((op = this.ops.pop())) {
      if (op[0] === "LParen") {
        this.throwError(`Unmatched '(' at position ${op[2]}.`, op);
        // throw new Error("Unexpected '('.");
      } else {
        this.evalOp(op[1]);
      }
    }
    console.assert(this.vals.length === 1);
    return this.vals[0];
  }

  evalOp(op: Op): void {
    if (isBinOp(op)) {
      let y = this.vals.pop();
      let x = this.vals.pop();
      if (x === undefined || y === undefined) {
        this.throwError("Unspecified parsing error.");
      }
      this.vals.push(binOp(op, x, y));
    } else {
      // unary op
      let x = this.vals.pop();
      this.vals.push(unOp(op, x));
    }
  }

  throwError(m: string, t?: Tok) {
    if (t === undefined) {
      throw new Error(m);
    } else {
      throw new Error(
        `${m}\n\n${this.s}\n${" ".repeat(t[2])}\u25B2\n${
          t && "\u2500".repeat(t[2])
        }\u256F`
      );
    }
  }
}

// let expr = "(-1)x";
// let P = new Parser(expr, { sin: 0, x: 2 });
// console.log(P.parse());
