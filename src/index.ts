import { Vector, OpTok, LParenTok, Scope, Tok } from "./Types";
import { prec, assoc, fixity, unOp, binOp, isUnOp, isBinOp } from "./Ops";
import tokenize from "./Tokenizer";

export function parse(s: string, scope: Scope = {}): number | Vector {
  const allowedIdents = Object.keys(scope);
  const ts = tokenize(s, allowedIdents);
  const ops: (OpTok | LParenTok)[] = [];
  const vals: (number | Vector)[] = [];
  let index = 0;

  while (index < ts.length) {
    const t = ts[index++];
    switch (t[0]) {
      case "Num":
        vals.push(t[1]);
        break;
      case "Ident":
        vals.push(scope[t[1]]);
        break;
      case "LParen":
        ops.push(t);
        break;
      case "RParen":
        {
          const op = ops.pop();
          if (op === undefined) {
            throwError(`Unmatched ')' at ${t[2]}.`, t);
          }
          if (op[0] !== "LParen") {
            evalOp(op);
            index--;
          }
        }
        break;
      case "UnOp":
      case "BinOp":
        {
          const op = ops.pop();
          if (op === undefined) {
            ops.push(t);
          } else if (op[0] === "LParen") {
            ops.push(op, t);
          } else if (
            prec[t[1]] > prec[op[1]] ||
            (prec[t[1]] === prec[op[1]] && assoc[t[1]] === "right") ||
            (prec[t[1]] <= prec[op[1]] &&
              isUnOp(t[1]) &&
              fixity[t[1]] === "prefix")
          ) {
            ops.push(op, t);
          } else {
            index--;
            evalOp(op);
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
  while ((op = ops.pop())) {
    if (op[0] === "LParen") {
      throwError(`Unmatched '(' at position ${op[2]}.`, op);
      // throw new Error("Unexpected '('.");
    } else {
      evalOp(op);
    }
  }
  console.assert(vals.length === 1);
  return vals[0];

  function evalOp(op: OpTok): void {
    if (isBinOp(op[1])) {
      const y = vals.pop();
      const x = vals.pop();
      if (x === undefined || y === undefined) {
        throwError("Unspecified parsing error.");
      }
      vals.push(binOp(op[1], x, y));
    } else {
      // unary op
      const x = vals.pop();
      if (x === undefined) {
        throwError(`Expected argument of ${op[1]}`, op);
      }
      vals.push(unOp(op[1], x));
    }
  }

  function throwError(m: string, t?: Tok): never {
    if (t === undefined) {
      throw new Error(m);
    } else {
      throw new Error(
        `${m}\n\n${s}\n${" ".repeat(t[2])}\u25B2\n${
          t && "\u2500".repeat(t[2])
        }\u256F`
      );
    }
  }
}
