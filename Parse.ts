import { isNum, isUnOp, isBinOp, Op, Token, isIdent, Scope } from "./Types";
import { unOp, binOp, prec, assoc, fixity } from "./Ops";

import Tokenizer from "./Tokenize";

export default class Parser {
  s: string;
  scope: Scope;
  ts: [Token, number][];
  index = 0;
  ops: (Op | "(")[] = [];
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
      let [t, i] = this.ts[this.index++];
      if (isNum(t)) {
        this.vals.push(t);
      } else if (isIdent(t)) {
        this.vals.push(this.scope[t]);
      } else if (t === "(") {
        this.ops.push(t);
      } else if (t === ")") {
        let op = this.ops.pop();
        if (op !== "(") {
          this.evalOp(op);
          this.index--;
          //   ts.push(")");
        }
      } else {
        // t is an operator
        let op = this.ops.pop();
        if (op === undefined) {
          this.ops.push(t);
        } else if (op === "(") {
          this.ops.push(op, t);
        } else if (
          prec[t] > prec[op] ||
          (prec[t] === prec[op] && assoc[t] === "right") ||
          (prec[t] <= prec[op] && isUnOp(t) && fixity[t] === "prefix")
        ) {
          this.ops.push(op, t);
        } else {
          //ts.push(t);
          this.index--;
          this.evalOp(op);
        }
      }
    }
    // All tokens processed.
    // Clear out operation and value stacks.
    let op: Op | "(";
    while ((op = this.ops.pop())) {
      if (op === "(") {
        throw new Error("Unexpected '('.");
      } else {
        this.evalOp(op);
      }
    }
    console.assert(this.vals.length === 1);
    return this.vals[0];
  }

  evalOp(op: Op): void {
    if (isBinOp(op)) {
      let y = this.vals.pop();
      let x = this.vals.pop();
      this.vals.push(binOp(op, x, y));
    } else {
      // unary op
      let x = this.vals.pop();
      this.vals.push(unOp(op, x));
    }
  }
}

// let expr = "((1)";
// let P = new Parser(expr);
// console.log(P.parse(), eval(expr));
