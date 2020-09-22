import TokenStack, { Token, OpTok, FunTok, LParenTok } from "./TokenStack";
import { builtInFuns, opData } from "./BuiltIns";

export { builtInFuns };

type List<T> = T[];
type Value = number | List<number>;

export default class Parser {
  tokenStack: TokenStack;
  valStack: Value[] = [];
  opStack: (OpTok | LParenTok | FunTok)[] = [];

  constructor(
    src: string,
    vars: Record<string, number> = {},
    funs: Record<string, (...args: number[]) => number> = builtInFuns
  ) {
    this.tokenStack = new TokenStack(src, vars, funs);
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
            let tt = this.opStack.pop();
            if (tt === undefined) {
              this.opStack.push(t);
            } else if (tt.type === "FUN") {
              this.tokenStack.push(t);
              this.applyFun(tt);
            } else if (tt.type === "LPAREN") {
              this.opStack.push(tt, t);
            } else {
              let { prec: tprec, arity: tarity, assoc: tassoc } = opData[
                t.name
              ];
              let { prec: ttprec, arity: ttarity, assoc: ttassoc } = opData[
                tt.name
              ];
              if (tprec > ttprec || (tarity === 1 && ttarity === 2)) {
                this.opStack.push(tt, t);
              } else if (tprec < ttprec) {
                this.tokenStack.push(t);
                this.applyOp(tt);
              } else {
                // equal precedence
                if (tassoc !== ttassoc) {
                  throw new Error(
                    `All operators with the same precedence must have the same associativity.`
                  );
                } else if (tassoc === "RTL") {
                  this.opStack.push(tt, t);
                } else {
                  this.tokenStack.push(t);
                  this.applyOp(tt);
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
    if (this.valStack.length === 1 && typeof this.valStack[0] === "number") {
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
    if (typeof arg === "number") {
      this.valStack.push(t.apply(arg));
    } else {
      this.valStack.push(t.apply(...arg));
    }
  }

  applyOp(t: OpTok): void {
    switch (t.name) {
      case "u+":
      case "u-": {
        let x = this.valStack.pop();
        if (x === undefined) {
          throw new Error(`Not enough arguments for ${t.name}.`);
        } else if (Array.isArray(x)) {
          throw new Error(`Can't apply ${t.name} to ${x}.`);
        } else {
          this.valStack.push(opData[t.name].apply(x));
        }
        break;
      }
      case "+":
      case "-":
      case "*":
      case "/":
      case "^":
      case "=": {
        let y = this.valStack.pop();
        let x = this.valStack.pop();
        if (x === undefined || y === undefined) {
          throw new Error(`Not enough arguments for ${t.name}.`);
        } else if (Array.isArray(x) || Array.isArray(y)) {
          throw new Error(`Can't apply ${t.name} to ${x}.`);
        } else {
          this.valStack.push(opData[t.name].apply(x, y));
        }
        break;
      }
      case ",": {
        let y = this.valStack.pop();
        let x = this.valStack.pop();
        if (x === undefined || y === undefined) {
          throw new Error(`Not enough arguments for ${t.name}.`);
        } else if (Array.isArray(y)) {
          throw new Error(`Can't apply ${t.name} to ${x}.`);
        } else {
          this.valStack.push(opData[t.name].apply(x, y));
        }
        break;
      }
      default: {
        throw new Error(`Unknown operation: '${t.name}'`);
      }
    }
  }
}

// const x = 3.14;
// const y = 2.71;
// const expr = "exp(x+y) = exp(x)*exp(y)";
// let P = new Parser(expr, { x, y }, {});
// console.log(P.parse());
