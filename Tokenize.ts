import { Tok, TokType } from "./Types";

const desc = {
  Num: "number",
  Ident: "identifier",
};

export default class Tokenizer {
  s: string;
  index: number = 0;
  allowedIdents: string[];

  constructor(s: string, allowedIdents: string[] = []) {
    this.s = s;
    this.allowedIdents = allowedIdents;
  }

  tokenize(): Tok[] {
    this.skipWhitespace();
    let ts: Tok[] = [];
    while (this.index < this.s.length) {
      let cur = this.s[this.index];
      let prev = ts[ts.length - 1];
      switch (cur) {
        case "(":
          this.isValidTokCharOrder(prev, "LParen", cur);
          ts.push(["LParen", cur, this.index++]);
          break;
        case ")":
          this.isValidTokCharOrder(prev, "RParen", cur);
          ts.push(["RParen", cur, this.index++]);
          break;
        case "*":
          this.isValidTokCharOrder(prev, "BinOp", cur);
          if (this.s[this.index + 1] === "*") {
            ts.push(["BinOp", "**", this.index]);
            this.index += 2;
          } else {
            ts.push(["BinOp", "*", this.index++]);
          }
          break;
        case "+":
        case "-":
          {
            let top = ts[ts.length - 1];
            if (
              top &&
              (top[0] === "Num" || top[0] === "Ident" || top[0] === "RParen")
            ) {
              this.isValidTokCharOrder(prev, "BinOp", cur);
              ts.push(["BinOp", cur, this.index++]);
            } else {
              this.isValidTokCharOrder(prev, "UnOp", cur);
              ts.push(["UnOp", cur === "+" ? "u+" : "u-", this.index++]);
            }
          }
          break;
        case "/":
        case "^":
          this.isValidTokCharOrder(prev, "BinOp", cur);
          ts.push(["BinOp", cur, this.index++]);
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case ".":
          {
            this.isValidTokCharOrder(prev, "Num", cur);
            let [num, i] = this.scanNumber();
            ts.push(["Num", num, i]);
          }
          break;
        case "a":
        case "b":
        case "c":
        case "d":
        case "e":
        case "f":
        case "g":
        case "h":
        case "i":
        case "j":
        case "k":
        case "l":
        case "m":
        case "n":
        case "o":
        case "p":
        case "q":
        case "r":
        case "s":
        case "t":
        case "u":
        case "v":
        case "w":
        case "x":
        case "y":
        case "z":
        case "A":
        case "B":
        case "C":
        case "D":
        case "E":
        case "F":
        case "G":
        case "H":
        case "I":
        case "J":
        case "K":
        case "L":
        case "M":
        case "N":
        case "O":
        case "P":
        case "Q":
        case "R":
        case "S":
        case "T":
        case "U":
        case "V":
        case "W":
        case "X":
        case "Y":
        case "Z":
        case "$":
        case "_":
          {
            this.isValidTokCharOrder(prev, "Ident", cur);
            let [ident, i] = this.scanIdent();
            if (!this.allowedIdents.includes(ident)) {
              this.throwError(
                `Unknown identifier '${ident}' at position ${i}.`,
                i
              );
            }
            ts.push(["Ident", ident, i]);
          }
          break;
        default:
          this.throwError(
            `Unexpected character '${this.s[this.index]}' at position ${
              this.index
            }.`
          );
      }
      this.skipWhitespace();
    }
    let last = ts[ts.length - 1];
    if (last === undefined) {
      throw new Error("Empty expression.");
    } else if (
      last[0] === "UnOp" ||
      last[0] === "BinOp" ||
      last[0] === "LParen"
    ) {
      this.throwError("Unexpected end of expression.");
    }
    return ts;
  }

  skipWhitespace() {
    while (this.s[this.index]?.trim() === "") {
      this.index++;
    }
  }

  scanNumber(): [number, number] {
    let start = this.index;
    if (this.s[this.index] === ".") {
      this.index++;
      if (isDigit(this.s[this.index])) {
        // scan fractional part
        this.index++;
        while (isDigit(this.s[this.index])) {
          this.index++;
        }
      } else {
        this.throwError(
          "Error parsing number. Fractional part expected after decimal point."
        );
      }
    } else {
      // this.cur is a digit
      // scan integer part
      while (isDigit(this.s[this.index])) {
        this.index++;
      }
      if (this.s[this.index] === ".") {
        // scan fractional part
        this.index++;
        while (isDigit(this.s[this.index])) {
          this.index++;
        }
      }
    }
    if (this.s[this.index] === "e") {
      // scan exponent
      this.index++;
      if (this.s[this.index] === "+" || this.s[this.index] === "-") {
        // scan sign of the exponent
        this.index++;
      }
      if (isDigit(this.s[this.index])) {
        // scan the nonnegative integer part of the exponent
        this.index++;
        while (isDigit(this.s[this.index])) {
          this.index++;
        }
      } else {
        this.throwError(
          "Error parsing number. Integer exponent expected after 'e'."
        );
      }
    }
    return [Number(this.s.slice(start, this.index)), start];
  }

  scanIdent(): [string, number] {
    let start = this.index++;
    while (isIdentChar(this.s[this.index])) {
      this.index++;
    }
    return [this.s.slice(start, this.index), start];
  }

  isValidTokCharOrder(
    prev: Tok | undefined,
    tokType: TokType,
    cur: string
  ): true {
    let p: TokType | undefined = prev?.[0];
    switch (p) {
      case undefined:
      case "UnOp":
      case "BinOp":
      case "LParen":
        if (tokType === "BinOp" || tokType === "RParen") {
          this.throwError(`Unexpected '${cur}' at position ${this.index}.`);
        }
        break;
      case "Num":
      case "RParen":
      case "Ident":
        if (tokType === "Num") {
          this.throwError(`Unexpected number at position ${this.index}.`);
        }
        if (tokType === "Ident") {
          this.throwError(`Unexpected identifier at position ${this.index}.`);
        }
        if (
          tokType === "Num" ||
          tokType === "UnOp" ||
          tokType === "LParen" ||
          tokType === "Ident"
        ) {
          this.throwError(`Unexpected '${cur}' at position ${this.index}.`);
        }
        break;
      default:
        p;
        this.throwError(
          `Unspecified tokenization error at position ${this.index}.`
        );
    }
    return true;
  }

  throwError(m: string, i = this.index) {
    throw new Error(
      `${m}\n\n${this.s}\n${" ".repeat(i)}\u25B2\n${"\u2500".repeat(i)}\u256F`
    );
  }
}

export function isDigit(c: any) {
  return (
    c === "0" ||
    c === "1" ||
    c === "2" ||
    c === "3" ||
    c === "4" ||
    c === "5" ||
    c === "6" ||
    c === "7" ||
    c === "8" ||
    c === "9"
  );
}

export function isLetter(s: any) {
  return (
    typeof s === "string" &&
    s.length === 1 &&
    ((s.charCodeAt(0) >= 97 && s.charCodeAt(0) < 123) ||
      (s.charCodeAt(0) >= 65 && s.charCodeAt(0) < 91))
  );
}

export function isIdentChar(s: any) {
  return isLetter(s) || isDigit(s) || s === "$" || s === "_";
}

// let s = ".%2exxx";
// let tokenizer = new Tokenizer(s, ["xxx", "yy", "z"]);
// console.log(tokenizer.tokenize());
