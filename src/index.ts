import TokenStack, { Token, OpTok, FunTok, LParenTok } from "./TokenStack";

interface OperatorProps {
  arity: 1 | 2;
  prec: number;
  fixity: "PREFIX" | "INFIX" | "POSTFIX";
  assoc: "LTR" | "RTL";
  apply: (...args: number[]) => number;
}

const opData: Record<string, OperatorProps> = {
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

export default class Parser {
  tokenStack: TokenStack;
  vars: Record<string, number>;
  funs: Record<string, (x: number) => number>;
  valStack: number[] = [];
  opStack: (OpTok | LParenTok | FunTok)[] = [];

  constructor(
    src: string,
    vars: Record<string, number> = {},
    funs: Record<string, (...args: number[]) => number> = {}
  ) {
    this.tokenStack = new TokenStack(src, vars);
    this.vars = vars;
    this.funs = funs;
  }

  parse(): number {
    let t: Token | undefined;
    while ((t = this.tokenStack.pop())) {
      switch (t.type) {
        case "NUM":
          this.valStack.push(t.value);
          break;
        case "FUN":
        case "LPAREN":
          this.opStack.push(t);
          break;
        case "RPAREN": {
          let op = this.popOps();
          if (op === undefined) {
            throw new Error(`Unmatched ')': ${JSON.stringify(t)}`);
          }
          break;
        }
        case "OP":
          {
            let top = this.opStack.pop();
            if (top === undefined) {
              this.opStack.push(t);
            } else if (top.type === "FUN") {
              this.tokenStack.push(t);
              this.applyFun(top);
            } else if (top.type === "LPAREN") {
              this.opStack.push(top, t);
            } else {
              let { prec: tPrec, arity: tArity, assoc: tAssoc } = opData[t.op];
              let { prec: topPrec, arity: topArity, assoc: topAssoc } = opData[
                top.op
              ];
              if (tPrec > topPrec || (tArity === 1 && topArity === 2)) {
                this.opStack.push(top, t);
              } else if (tPrec < topPrec) {
                this.tokenStack.push(t);
                this.applyOp(top);
              } else {
                // equal precedence
                if (tAssoc !== topAssoc) {
                  throw new Error(
                    `All operators with the same precedence must have the same associativity.`
                  );
                } else if (tAssoc === "RTL") {
                  this.opStack.push(top, t);
                } else {
                  this.tokenStack.push(t);
                  this.applyOp(top);
                }
              }
            }
          }
          break;
        default:
          throw new Error(`Unknown token: ${t}`);
      }
    }
    // Apply all remaining ops.
    let op = this.popOps();
    if (op?.type === "LPAREN") {
      throw new Error(`Unmatched '(': ${JSON.stringify(op)}`);
    }
    // Check no values left over.
    if (this.valStack.length === 1) {
      return this.valStack[0];
    } else {
      throw new Error("Unspecified parsing error!");
    }
  }

  popOps(): LParenTok | undefined {
    let op: OpTok | LParenTok | FunTok | undefined;
    while ((op = this.opStack.pop())) {
      if (op.type === "LPAREN") {
        return op;
      } else if (op.type === "FUN") {
        this.applyFun(op);
      } else {
        this.applyOp(op);
      }
    }
    return op;
  }

  applyFun(t: FunTok): void {
    let arg = this.valStack.pop();
    if (arg === undefined) {
      throw new Error(`Insufficient arguments for ${t.name}.`);
    }
    this.valStack.push(t.apply(arg));
  }

  applyOp(t: OpTok): void {
    let args = [];
    for (let i = 0; i < opData[t.op].arity; i++) {
      let arg = this.valStack.pop();
      if (arg === undefined) {
        throw new Error(`Insufficient arguments for ${t}.`);
      }
      args.push(arg);
    }
    this.valStack.push(opData[t.op].apply(...args.reverse()));
  }
}

// let T = new TokenStack("1+abs(x_1_)");

// for (let i = 0; i < 7; i++) {
//   let t = T.pop();
//   console.log(t);
// }

// let P = new Parser("abs()");
// console.log(P.parse());
// let t: Token | undefined;
// while ((t = P.getToken())) {
//   console.log(t);
// }
