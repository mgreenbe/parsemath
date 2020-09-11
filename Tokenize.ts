import {
  isNum,
  isIdent,
  Token,
  isDigit,
  isIdentChar,
  isIdentStartChar,
} from "./Types";

class Tokenizer {
  s: string;
  index: number = 0;
  allowedIdents: string[];
  constructor(s: string, allowedIdents: string[] = []) {
    this.s = s;
    this.allowedIdents = allowedIdents;
  }

  cur() {
    return this.s[this.index];
  }

  next() {
    return this.s[this.index + 1];
  }

  tokenize(): [Token, number][] {
    this.skipWhitespace();
    let ts: [Token, number][] = [];
    while (this.index < this.s.length) {
      let cur = this.cur();
      if (cur === "*" && this.next() === "*") {
        ts.push(["**", this.index]);
        this.index += 2;
      } else if (cur === "+" || cur === "-") {
        let top = ts[ts.length - 1]?.[0];
        if (isNum(top) || isIdent(top) || top === ")") {
          ts.push([cur, this.index++]);
        } else {
          ts.push([cur === "+" ? "u+" : "u-", this.index++]);
        }
      } else if (
        cur === "*" ||
        cur === "/" ||
        cur === "^" ||
        cur === "(" ||
        cur === ")"
      ) {
        ts.push([cur, this.index++]);
      } else if (isDigit(cur) || cur === ".") {
        let t = this.scanNumber();
        ts.push(t);
      } else if (isIdentStartChar(cur)) {
        let t = this.scanIdent();
        if (!this.allowedIdents.includes(t[0])) {
          this.throwError(
            `Unknown identifier '${t[0]}' at position ${t[1]}.`,
            t[1]
          );
        }
        ts.push(t);
      } else {
        this.throwError(
          `Unexpected character '${this.cur()}' at position ${this.index}.`
        );
      }
      this.skipWhitespace();
    }
    return ts;
  }

  throwError(m: string, i = this.index) {
    throw new Error(
      `${m}\n\n${this.s}\n${" ".repeat(i)}\u25B2\n${"\u2500".repeat(i)}\u256F`
    );
  }

  skipWhitespace() {
    while (this.cur()?.trim() === "") {
      this.index++;
    }
  }

  scanNumber(): [number, number] {
    let start = this.index;
    if (this.cur() === ".") {
      this.index++;
      if (isDigit(this.cur())) {
        // scan fractional part
        this.index++;
        while (isDigit(this.cur())) {
          this.index++;
        }
      } else {
        throw new Error("Fractional part expected.");
      }
    } else {
      // integer part
      while (isDigit(this.cur())) {
        this.index++;
      }
      if (this.cur() === ".") {
        // fractional part
        this.index++;
        while (isDigit(this.cur())) {
          this.index++;
        }
      }
    }
    if (this.cur() === "e") {
      // exponent
      this.index++;
      if (this.cur() === "+" || this.cur() === "-") {
        // sign of the exponent
        this.index++;
      }
      if (isDigit(this.cur())) {
        // the nonnegative integer part of the exponent
        this.index++;
        while (isDigit(this.cur())) {
          this.index++;
        }
      } else {
        throw new Error("Exponent expected.");
      }
    }
    return [Number(this.s.slice(start, this.index)), start];
  }

  scanIdent(): [string, number] {
    let start = this.index++;
    while (isIdentChar(this.cur())) {
      this.index++;
    }
    return [this.s.slice(start, this.index), start];
  }
}

let s = "      xxx+ 101.123+~2.987e0*yy/z";
let tokenizer = new Tokenizer(s, ["xxx", "yy", "z"]);
console.log(tokenizer.tokenize());
