import TokenStack, {
  Token,
  IdentTok,
  OpTok,
  LParenTok,
  LBrakTok,
} from "./TokenStack";
import Matrix from "mattrix";
import { builtInFuns, Fun, FunRec } from "./Functions";
import { opData } from "./Operators";
// import { builtInFuns, opData, Fun, FunRec } from "./BuiltIns";

export { builtInFuns };

export class Parser {
  tokenStack: TokenStack;
  valStack: (Matrix | Matrix[])[] = [];
  opStack: (OpTok | LParenTok | LBrakTok | IdentTok)[] = [];
  vars: Record<string, Matrix>;
  funs: Record<string, FunRec>;
  nesting: ("GROUP" | "ARGLIST" | "VECTOR")[] = [];

  constructor(
    src: string,
    vars: Record<string, number | Matrix> = {},
    funs: Record<string, FunRec> = builtInFuns
  ) {
    this.tokenStack = new TokenStack(src);
    this.vars = Object.fromEntries(
      Object.entries(vars).map(([key, value]): [string, Matrix] => [
        key,
        typeof value === "number" ? Matrix.fromNumber(value) : value,
      ])
    );
    this.funs = funs;
  }

  parse(): Matrix {
    let t: Token | undefined;
    while ((t = this.tokenStack.pop())) {
      switch (t.type) {
        case "VALUE":
          this.valStack.push(t.value);
          break;
        case "IDENT":
          {
            let value = this.vars[t.name];
            if (value !== undefined) {
              this.valStack.push(value);
            } else {
              if (this.funs[t.name] === undefined) {
                throw new Error(
                  `Unknown identifier ${t.name} at position ${t.startPos}`
                );
              }
              let tt = this.tokenStack.pop();
              if (tt === undefined) {
                throw new Error(
                  `Unexpected end of input at position ${
                    t.startPos + t.name.length
                  }`
                );
              } else if (tt.type !== "LPAREN") {
                throw new Error(
                  `Expected '(' at position ${t.startPos + t.name.length}`
                );
              }
              this.opStack.push(t);
              this.opStack.push(tt);
              this.nesting.push("ARGLIST");
            }
          }

          break;
        case "LPAREN":
          this.opStack.push(t);
          this.nesting.push("GROUP");
          break;
        case "LBRAK":
          this.opStack.push(t);
          this.nesting.push("VECTOR");
          break;
        case "RPAREN":
        case "RBRAK": {
          let op = this.popOps();
          if (op === undefined) {
            throw new Error(`Unmatched ')' or ']': ${JSON.stringify(t)}`);
          }
          this.nesting.pop();
          break;
        }
        case "OP":
          {
            let tt = this.opStack.pop();
            if (tt === undefined) {
              this.opStack.push(t);
            } else if (tt.type === "IDENT") {
              this.tokenStack.push(t);
              this.applyFun(tt);
            } else if (tt.type === "LPAREN" || tt.type === "LBRAK") {
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
    if (this.nesting.length > 1) {
      throw new Error(`nesting = ${this.nesting}`);
    }
    // Check no values left over.
    if (this.valStack.length === 1 && this.valStack[0] instanceof Matrix) {
      return this.valStack[0];
    } else {
      throw new Error("Unspecified parsing error!");
    }
  }

  popOps(): LParenTok | LBrakTok | undefined {
    let op: OpTok | LParenTok | LBrakTok | IdentTok | undefined;
    while ((op = this.opStack.pop())) {
      if (op.type === "LPAREN" || op.type === "LBRAK") {
        return op;
      } else if (op.type === "IDENT") {
        this.applyFun(op);
      } else {
        this.applyOp(op);
      }
    }
    return op;
  }

  applyFun(t: IdentTok): void {
    let f = this.funs[t.name];
    if (f === undefined) {
      throw new Error(
        `Unknown function: ${t.name}\n**This shouldn't happen!**`
      );
    }
    let arg = this.valStack.pop();
    let result: Matrix;
    if (arg === undefined) {
      if (f.nargs === 0) {
        result = f.apply();
      } else {
        throw new Error(
          `The function ${t.name} takes ${f.nargs} arguments. You provided 0.`
        );
      }
    } else if (arg instanceof Matrix) {
      if (f.nargs === 1) {
        result = f.apply(arg);
      } else {
        throw new Error(
          `The function ${t.name} takes ${f.nargs} arguments. You provided 1.`
        );
      }
    } else {
      if (f.nargs === arg.length) {
        result = f.apply(...arg);
      } else {
        throw new Error(
          `The function ${t.name} takes ${f.nargs} arguments. You provided ${arg.length}.`
        );
      }
    }
    this.valStack.push(result);
  }

  applyOp(t: OpTok): void {
    switch (t.name) {
      case "u+":
      case "u-": {
        let x = this.valStack.pop();
        if (x === undefined) {
          throw new Error(`Not enough arguments for ${t.name}.`);
        } else if (x instanceof Matrix) {
          let result = opData[t.name].apply(x);
          this.valStack.push(result);
        } else {
          throw new Error(`Can't apply ${t.name} to ${x}.`);
        }
        break;
      }
      case "+":
      case "-":
      case "*":
      case "/":
      case "^":
      case "=":
      case ",":
      case ";": {
        let y = this.valStack.pop();
        let x = this.valStack.pop();
        if (
          t.name !== "," ||
          this.nesting[this.nesting.length - 1] === "VECTOR"
        ) {
          if (x === undefined || y === undefined) {
            throw new Error(`Not enough arguments for ${t.name}.`);
          } else if (Array.isArray(x) || Array.isArray(y)) {
            throw new Error(
              `An argument list shouldn't be here.\n**This shouldn't have happened!**`
            );
          } else {
            let result = opData[t.name].apply(x, y);
            this.valStack.push(result);
          }
          break;
        } else {
          if (x === undefined || y === undefined) {
            throw new Error(`Not enough arguments for ${t.name}.`);
          } else {
            let xx = x instanceof Matrix ? [x] : x;
            let yy = y instanceof Matrix ? [y] : y;
            this.valStack.push([...xx, ...yy]);
          }
        }
        break;
      }
      default: {
        throw new Error(`Unknown operation: '${t}'`);
      }
    }
  }
}

export function parse(
  expr: string,
  scope?: Record<string, number | Matrix>,
  funs?: Record<string, { nargs: number; apply: Fun }>
) {
  let P = new Parser(expr, scope, funs);
  return P.parse();
}

// parse(
//   "[sin(pi),cos(pi), pi*0.5]=[1,0,pi/2]",
//   { pi: Math.PI / 2 },
//   builtInFuns
// ).log();
