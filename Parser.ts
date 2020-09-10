import { tokenize } from "./Tokenizer";
import { isNum, isUnOp, isBinOp, Ident, Op, Token, isIdent } from "./Types";
import { unOp, binOp, prec, assoc, fixity } from "./Ops";

function parse(s: string, variables: { [s: string]: number } = {}): number {
  let ts = tokenize(s).reverse();
  //   console.log(ts);
  let ops: (Op | "(")[] = [];
  let vals: number[] = [];
  //   console.log(`ts = [${ts.join(", ")}]\n`);
  let t: Token;
  while ((t = ts.pop())) {
    // console.log(
    //   `t = ${t}; vals = [${vals.join(", ")}]; ops = [${ops.join(", ")}]\n`
    // );
    if (isNum(t)) {
      vals.push(t);
    } else if (isIdent(t)) {
      vals.push(variables[t]);
    } else if (t === "(") {
      ops.push(t);
    } else if (t === ")") {
      let op = ops.pop();
      if (op !== "(") {
        evalOp(op, vals);
        ts.push(")");
      }
    } else {
      // t is an operator
      let op = ops.pop();
      if (op === undefined) {
        ops.push(t);
      } else if (op === "(") {
        ops.push(op, t);
      } else if (
        prec[t] > prec[op] ||
        (prec[t] === prec[op] && assoc[t] === "right") ||
        (prec[t] <= prec[op] && isUnOp(t) && fixity[t] === "prefix")
      ) {
        ops.push(op, t);
      } else {
        ts.push(t);
        evalOp(op, vals);
      }
    }
  }
  //   console.log(`vals = [${vals.join(", ")}]; ops = [${ops.join(", ")}]\n`);
  let op: Op | "(";
  while ((op = ops.pop())) {
    if (op === "(") {
      throw new Error("Unexpected '('.");
    } else {
      evalOp(op, vals);
    }

    // console.log(`vals = [${vals.join(", ")}]; ops = [${ops.join(", ")}]\n`);
  }
  console.assert(vals.length === 1);
  return vals[0];
}

function evalOp(op: Op, vals: number[]): void {
  if (isBinOp(op)) {
    let y = vals.pop();
    let x = vals.pop();
    vals.push(binOp(op, x, y));
  } else {
    // unary op
    let x = vals.pop();
    vals.push(unOp(op, x));
  }
}

export default parse;
