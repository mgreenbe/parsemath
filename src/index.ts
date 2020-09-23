import TokenStack, {
  Token,
  OpTok,
  FunTok,
  LParenTok,
  LBrakTok,
} from "./TokenStack";
import { Vector, vec } from "./Vector";
import { builtInFuns, opData, FunRec } from "./BuiltIns";

export { builtInFuns };

type Value = { type: "VALUE"; value: number | Vector };
type ValueList = { type: "LIST"; list: (number | Vector)[] };

export default class Parser {
  tokenStack: TokenStack;
  valStack: (Value | ValueList)[] = [];
  opStack: (OpTok | LParenTok | LBrakTok | FunTok)[] = [];
  funs: Record<string, FunRec>;
  nesting: ("GROUP" | "ARGLIST" | "VECTOR")[] = [];

  constructor(
    src: string,
    vars: Record<string, number | Vector> = {},
    funs: Record<string, FunRec> = builtInFuns
  ) {
    this.tokenStack = new TokenStack(src, vars, funs);
    this.funs = funs;
  }

  parse(): number | Vector {
    let t: Token | undefined;
    while ((t = this.tokenStack.pop())) {
      switch (t.type) {
        case "NUM":
        case "IDENT":
          this.valStack.push({ type: "VALUE", value: t.value });
          break;
        case "FUN":
          this.opStack.push(t);
          t = this.tokenStack.pop();
          if (t === undefined) {
            throw new Error(`Unexpected end of input. Expected '('.`);
          } else if (t.type === "LPAREN") {
            this.opStack.push(t);
            this.nesting.push("ARGLIST");
          } else {
            throw new Error(`Expected '('.`);
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
            } else if (tt.type === "FUN") {
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
    if (this.valStack.length === 1 && this.valStack[0].type === "VALUE") {
      return this.valStack[0].value;
    } else {
      throw new Error("Unspecified parsing error!");
    }
  }

  popOps(): LParenTok | LBrakTok | undefined {
    let op: OpTok | LParenTok | LBrakTok | FunTok | undefined;
    while ((op = this.opStack.pop())) {
      if (op.type === "LPAREN" || op.type === "LBRAK") {
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
    let f = this.funs[t.name];
    if (f === undefined) {
      throw new Error(`Unknown function: ${t.name}`);
    }
    let arg = this.valStack.pop();
    let result: number | Vector;
    if (arg === undefined) {
      if (f.nargs === 0) {
        result = f.apply();
      } else {
        throw new Error(
          `The function ${t.name} takes ${f.nargs} arguments. You provided 0.`
        );
      }
    } else if (arg.type === "VALUE") {
      if (f.nargs === 1) {
        result = f.apply(arg.value);
      } else {
        throw new Error(
          `The function ${t.name} takes ${f.nargs} arguments. You provided 1.`
        );
      }
    } else {
      if (f.nargs === arg.list.length) {
        result = f.apply(...arg.list);
      } else {
        throw new Error(
          `The function ${t.name} takes ${f.nargs} arguments. You provided ${arg.list.length}.`
        );
      }
    }
    this.valStack.push({ type: "VALUE", value: result });
  }

  applyOp(t: OpTok): void {
    switch (t.name) {
      case "u+":
      case "u-": {
        let x = this.valStack.pop();
        if (x === undefined) {
          throw new Error(`Not enough arguments for ${t.name}.`);
        } else if (x.type === "VALUE") {
          let result = opData[t.name].apply(x.value);
          this.valStack.push({ type: "VALUE", value: result });
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
      case "=": {
        let y = this.valStack.pop();
        let x = this.valStack.pop();
        if (x === undefined || y === undefined) {
          throw new Error(`Not enough arguments for ${t.name}.`);
        } else if (x.type === "LIST" || y.type === "LIST") {
          throw new Error(`Can't apply ${t.name} to ${x}.`);
        } else {
          let result = opData[t.name].apply(x.value, y.value);
          this.valStack.push({ type: "VALUE", value: result });
        }
        break;
      }
      case ",": {
        let mode = this.nesting[this.nesting.length - 1];
        if (mode === "ARGLIST") {
          let y = this.valStack.pop();
          let x = this.valStack.pop();
          let list: ValueList;
          if (x === undefined || y === undefined) {
            throw new Error(`Not enough arguments for ${t.name}.`);
          } else if (x.type === "VALUE") {
            if (y.type === "VALUE") {
              this.valStack.push({ type: "LIST", list: [x.value, y.value] });
            } else {
              this.valStack.push({ type: "LIST", list: [x.value, ...y.list] });
            }
          } else {
            if (y.type === "VALUE") {
              this.valStack.push({ type: "LIST", list: [...x.list, y.value] });
            } else {
              this.valStack.push({
                type: "LIST",
                list: [...x.list, ...y.list],
              });
            }
          }
        } else if (mode === "VECTOR") {
          let y = this.valStack.pop();
          let x = this.valStack.pop();
          let list: ValueList;
          if (x === undefined || y === undefined) {
            throw new Error(`Not enough arguments for ${t.name}.`);
          } else if (x.type === "LIST" || y.type === "LIST") {
            throw new Error(`An arglist can't be a matrix entry`);
          }
          if (typeof x.value === "number") {
            if (typeof y.value === "number") {
              this.valStack.push({
                type: "VALUE",
                value: new Vector(x.value, y.value),
              });
            } else {
              this.valStack.push({
                type: "VALUE",
                value: new Vector(x.value, ...y.value),
              });
            }
          } else {
            if (typeof y.value === "number") {
              this.valStack.push({
                type: "VALUE",
                value: new Vector(...x.value, y.value),
              });
            } else {
              this.valStack.push({
                type: "VALUE",
                value: new Vector(...x.value, ...y.value),
              });
            }
          }
        } else {
          throw new Error(`Unexpected ','.`);
        }
        break;
      }
      default: {
        throw new Error(`Unknown operation: '${t}'`);
      }
    }
  }
}

// const expr1 = "[1,2,[3,4,[5,6,7], [8]],[9,  10]]";
// let P = new Parser(expr1);
// console.log(P.parse());
// expect(parse(expr1, {}, builtInFuns)).toBe(Math.PI / 4);
// const x = 3.14;
// const y = 2.71;
// const expr2 = "atan2(y, x) = atan(y/x)";
// expect(parse(expr2, { x, y }, builtInFuns)).toBe(1);
// const expr3 = "atan2(y,x)=2*atan( y/(sqrt(x^2+y^2)+x) )";
// expect(parse(expr3, { x, y }, builtInFuns)).toBe(1);
