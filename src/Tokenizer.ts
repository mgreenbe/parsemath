import { Tok, TokType } from "./Types";

export default function tokenize(s: string, allowedIdents: string[]): Tok[] {
  const ts: Tok[] = [];
  let index = 0;
  skipWhitespace();
  while (index < s.length) {
    const cur = s[index];
    const prev = ts[ts.length - 1];
    switch (cur) {
      case "(":
        isValidTokCharOrder(prev, "LParen", cur);
        ts.push(["LParen", cur, index++]);
        break;
      case ")":
        isValidTokCharOrder(prev, "RParen", cur);
        ts.push(["RParen", cur, index++]);
        break;
      case "*":
        isValidTokCharOrder(prev, "BinOp", cur);
        if (s[index + 1] === "*") {
          ts.push(["BinOp", "**", index]);
          index += 2;
        } else {
          ts.push(["BinOp", "*", index++]);
        }
        break;
      case "+":
      case "-":
        {
          const top = ts[ts.length - 1];
          if (
            top &&
            (top[0] === "Num" || top[0] === "Ident" || top[0] === "RParen")
          ) {
            isValidTokCharOrder(prev, "BinOp", cur);
            ts.push(["BinOp", cur, index++]);
          } else {
            isValidTokCharOrder(prev, "UnOp", cur);
            ts.push(["UnOp", cur === "+" ? "u+" : "u-", index++]);
          }
        }
        break;
      case "/":
      case "^":
      case "=":
        isValidTokCharOrder(prev, "BinOp", cur);
        ts.push(["BinOp", cur, index++]);
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
          isValidTokCharOrder(prev, "Num", cur);
          const [num, i] = scanNumber();
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
          isValidTokCharOrder(prev, "Ident", cur);
          const [ident, i] = scanIdent();
          if (!allowedIdents.includes(ident)) {
            throwError(`Unknown identifier '${ident}' at position ${i}.`, i);
          }
          ts.push(["Ident", ident, i]);
        }
        break;
      default:
        throwError(`Unexpected character '${s[index]}' at position ${index}.`);
    }
    skipWhitespace();
  }
  const last = ts[ts.length - 1];
  if (last === undefined) {
    throw new Error("Empty expression.");
  } else if (
    last[0] === "UnOp" ||
    last[0] === "BinOp" ||
    last[0] === "LParen"
  ) {
    throwError("Unexpected end of expression.");
  }
  return ts;

  function throwError(m: string, i = index): never {
    throw new Error(
      `${m}\n\n${s}\n${" ".repeat(i)}\u25B2\n${"\u2500".repeat(i)}\u256F`
    );
  }

  function skipWhitespace(): void {
    while (s[index]?.trim() === "") {
      index++;
    }
  }

  function scanNumber(): [number, number] {
    const start = index;
    if (s[index] === ".") {
      index++;
      if (isDigit(s[index])) {
        // scan fractional part
        index++;
        while (isDigit(s[index])) {
          index++;
        }
      } else {
        throwError(
          "Error parsing number. Fractional part expected after decimal point."
        );
      }
    } else {
      // cur is a digit
      // scan integer part
      while (isDigit(s[index])) {
        index++;
      }
      if (s[index] === ".") {
        // scan fractional part
        index++;
        while (isDigit(s[index])) {
          index++;
        }
      }
    }
    if (s[index] === "e") {
      // scan exponent
      index++;
      if (s[index] === "+" || s[index] === "-") {
        // scan sign of the exponent
        index++;
      }
      if (isDigit(s[index])) {
        // scan the nonnegative integer part of the exponent
        index++;
        while (isDigit(s[index])) {
          index++;
        }
      } else {
        throwError(
          "Error parsing number. Integer exponent expected after 'e'."
        );
      }
    }
    return [Number(s.slice(start, index)), start];
  }

  function scanIdent(): [string, number] {
    const start = index++;
    while (isIdentChar(s[index])) {
      index++;
    }
    return [s.slice(start, index), start];
  }

  function isValidTokCharOrder(
    prev: Tok | undefined,
    tokType: TokType,
    cur: string
  ): true {
    const p: TokType | undefined = prev?.[0];
    switch (p) {
      case undefined:
      case "UnOp":
      case "BinOp":
      case "LParen":
        if (tokType === "BinOp" || tokType === "RParen") {
          throwError(`Unexpected '${cur}' at position ${index}.`);
        }
        break;
      case "Num":
      case "RParen":
      case "Ident":
        if (tokType === "Num") {
          throwError(`Unexpected number at position ${index}.`);
        }
        if (tokType === "Ident") {
          throwError(`Unexpected identifier at position ${index}.`);
        }
        if (tokType === "UnOp" || tokType === "LParen") {
          throwError(`Unexpected '${cur}' at position ${index}.`);
        }
        break;
      default:
        p;
        throwError(`Unspecified tokenization error at position ${index}.`);
    }
    return true;
  }
}

export function isDigit(c: unknown): boolean {
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

export function isLetter(s: unknown): boolean {
  return (
    typeof s === "string" &&
    s.length === 1 &&
    ((s.charCodeAt(0) >= 97 && s.charCodeAt(0) < 123) ||
      (s.charCodeAt(0) >= 65 && s.charCodeAt(0) < 91))
  );
}

export function isIdentChar(s: unknown): boolean {
  return isLetter(s) || isDigit(s) || s === "$" || s === "_";
}
