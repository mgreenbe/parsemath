import {
  isDigit,
  isNum,
  isOp,
  Digit,
  Token,
  isIdentChar,
  isIdentStartChar,
  isIdent,
  IdentStartChar,
} from "./Types";

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
      let top = ts[ts.length - 1];
      if (isNum(top) || top === ")" || isIdent(top)) {
        ts.push(c);
      } else {
        ts.push(c === "+" ? "u+" : "u-");
      }
    } else if (isOp(c)) {
      ts.push(c);
    } else if (isDigit(c) || c === ".") {
      ts.push(scanNumber(cs, c));
    } else if (isIdentStartChar(c)) {
      ts.push(scanIdent(cs, c));
    }
    eatWhitespace(cs);
  }
  return ts;
}

function scanIdent(cs: string[], c: IdentStartChar) {
  let i = cs.length - 1;
  while (isIdentChar(cs[i])) {
    i--;
  }
  let ident: string = c;
  for (let j = cs.length - 1; j > i; j--) {
    ident += cs.pop();
  }
  return ident;
}
// let cs = Array.from("__$aZ - 123").reverse();
// let c = cs.pop() as IdentStartChar;
// console.log(scanIdent(cs, c), cs);

function scanNumber(cs: string[], c: "." | Digit): number {
  let i = cs.length - 1;
  if (c === ".") {
    // no integer part
    if (isDigit(cs[i])) {
      // scan fractional part
      i--;
      while (isDigit(cs[i])) {
        i--;
      }
    } else {
      throw new Error("Fractional part expected.");
    }
  } else {
    // integer part
    while (isDigit(cs[i])) {
      i--;
    }
    if (cs[i] === ".") {
      // fractional part
      i--;
      while (isDigit(cs[i])) {
        i--;
      }
    }
  }
  if (cs[i] === "e") {
    // exponent
    i--;
    if (cs[i] === "+" || cs[i] === "-") {
      // sign of the exponent
      i--;
    }
    if (isDigit(cs[i])) {
      // the nonnegative integer part of the exponent
      i--;
      while (isDigit(cs[i])) {
        i--;
      }
    } else {
      throw new Error("Exponent expected.");
    }
  }
  for (let j = cs.length - 1; j > i; j--) {
    c += cs.pop();
  }
  return Number(c);
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
