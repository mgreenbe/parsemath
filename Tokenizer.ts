import { isDigit, isNum, isOp, Token } from "./Types";

export function tokenize(s: string): Token[] {
  let ts: Token[] = [];
  let cs = Array.from(s.trimLeft()).reverse();
  while (cs.length > 0) {
    let c = cs.pop();
    if (c === "(" || c === ")") {
      ts.push(c);
    } else if (c === "*") {
      if (cs[cs.length - 1] === "*") {
        cs.pop();
        ts.push("**");
      } else {
        ts.push("*");
      }
    } else if (c === "+" || c === "-") {
      if (isNum(ts[ts.length - 1]) || ts[ts.length - 1] === ")") {
        ts.push(c);
      } else {
        ts.push(c === "+" ? "u+" : "u-");
      }
    } else if (isOp(c)) {
      ts.push(c);
    } else if (isDigit(c)) {
      ts.push(integer(cs, c));
    }
    eatWhitespace(cs);
  }
  return ts;
}

function integer(cs: string[], c: string): number {
  let n = c;
  while ((c = cs.pop())) {
    if (isDigit(c)) {
      n += c;
    } else {
      cs.push(c);
      break;
    }
  }
  return Number(n);
}

function eatWhitespace(cs: string[]): void {
  let c: string;
  while ((c = cs.pop())) {
    if (c.trimLeft() !== "") {
      cs.push(c);
      break;
    }
  }
}
