import { OpTok, LParenTok, Scope, Tok } from "./Types";
import { prec, assoc, fixity, unOp, binOp, isUnOp, isBinOp } from "./Ops";

import tokenize from "./Tokenizer2";

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
    const allowedIdents = Object.keys(scope);
    // const tokenizer = new Tokenizer(s, allowedIdents);
    this.ts = tokenize(s, allowedIdents);
  }

  parse(): number {
    while (this.index < this.ts.length) {
      const t = this.ts[this.index++];
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
            const op = this.ops.pop();
            if (op === undefined) {
              this.throwError(`Unmatched ')' at ${t[2]}.`, t);
            }
            if (op[0] !== "LParen") {
              this.evalOp(op);
              this.index--;
            }
          }
          break;
        case "UnOp":
        case "BinOp":
          {
            const op = this.ops.pop();
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
              this.evalOp(op);
            }
          }
          break;
        default:
          throw new Error("This shouldn't happen!");
      }
    }
    // All tokens processed.
    // Clear out operation and value stacks.
    let op: OpTok | LParenTok | undefined;
    while ((op = this.ops.pop())) {
      if (op[0] === "LParen") {
        this.throwError(`Unmatched '(' at position ${op[2]}.`, op);
        // throw new Error("Unexpected '('.");
      } else {
        this.evalOp(op);
      }
    }
    console.assert(this.vals.length === 1);
    return this.vals[0];
  }

  evalOp(op: OpTok): void {
    if (isBinOp(op[1])) {
      const y = this.vals.pop();
      const x = this.vals.pop();
      if (x === undefined || y === undefined) {
        this.throwError("Unspecified parsing error.");
      }
      this.vals.push(binOp(op[1], x, y));
    } else {
      // unary op
      const x = this.vals.pop();
      if (x === undefined) {
        this.throwError(`Expected argument of ${op[1]}`, op);
      }
      this.vals.push(unOp(op[1], x));
    }
  }

  throwError(m: string, t?: Tok): never {
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
