import { Tok } from "./Types";

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
      switch (cur) {
        case "(":
          ts.push(["LParen", cur, this.index++]);
          break;
        case ")":
          ts.push(["RParen", cur, this.index++]);
          break;
        case "*":
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
              ts.push(["BinOp", cur, this.index++]);
            } else {
              ts.push(["UnOp", cur === "+" ? "u+" : "u-", this.index++]);
            }
          }
          break;
        case "/":
        case "^":
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
