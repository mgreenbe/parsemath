"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIdentChar = exports.isLetter = exports.isDigit = void 0;
class Tokenizer {
    constructor(s, allowedIdents = []) {
        this.index = 0;
        this.s = s;
        this.allowedIdents = allowedIdents;
    }
    tokenize() {
        this.skipWhitespace();
        const ts = [];
        while (this.index < this.s.length) {
            const cur = this.s[this.index];
            const prev = ts[ts.length - 1];
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
                    }
                    else {
                        ts.push(["BinOp", "*", this.index++]);
                    }
                    break;
                case "+":
                case "-":
                    {
                        const top = ts[ts.length - 1];
                        if (top &&
                            (top[0] === "Num" || top[0] === "Ident" || top[0] === "RParen")) {
                            this.isValidTokCharOrder(prev, "BinOp", cur);
                            ts.push(["BinOp", cur, this.index++]);
                        }
                        else {
                            this.isValidTokCharOrder(prev, "UnOp", cur);
                            ts.push(["UnOp", cur === "+" ? "u+" : "u-", this.index++]);
                        }
                    }
                    break;
                case "/":
                case "^":
                case "=":
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
                        const [num, i] = this.scanNumber();
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
                        const [ident, i] = this.scanIdent();
                        if (!this.allowedIdents.includes(ident)) {
                            this.throwError(`Unknown identifier '${ident}' at position ${i}.`, i);
                        }
                        ts.push(["Ident", ident, i]);
                    }
                    break;
                default:
                    this.throwError(`Unexpected character '${this.s[this.index]}' at position ${this.index}.`);
            }
            this.skipWhitespace();
        }
        const last = ts[ts.length - 1];
        if (last === undefined) {
            throw new Error("Empty expression.");
        }
        else if (last[0] === "UnOp" ||
            last[0] === "BinOp" ||
            last[0] === "LParen") {
            this.throwError("Unexpected end of expression.");
        }
        return ts;
    }
    skipWhitespace() {
        var _a;
        while (((_a = this.s[this.index]) === null || _a === void 0 ? void 0 : _a.trim()) === "") {
            this.index++;
        }
    }
    scanNumber() {
        const start = this.index;
        if (this.s[this.index] === ".") {
            this.index++;
            if (isDigit(this.s[this.index])) {
                // scan fractional part
                this.index++;
                while (isDigit(this.s[this.index])) {
                    this.index++;
                }
            }
            else {
                this.throwError("Error parsing number. Fractional part expected after decimal point.");
            }
        }
        else {
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
            }
            else {
                this.throwError("Error parsing number. Integer exponent expected after 'e'.");
            }
        }
        return [Number(this.s.slice(start, this.index)), start];
    }
    scanIdent() {
        const start = this.index++;
        while (isIdentChar(this.s[this.index])) {
            this.index++;
        }
        return [this.s.slice(start, this.index), start];
    }
    isValidTokCharOrder(prev, tokType, cur) {
        const p = prev === null || prev === void 0 ? void 0 : prev[0];
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
                if (tokType === "UnOp" || tokType === "LParen") {
                    this.throwError(`Unexpected '${cur}' at position ${this.index}.`);
                }
                break;
            default:
                p;
                this.throwError(`Unspecified tokenization error at position ${this.index}.`);
        }
        return true;
    }
    throwError(m, i = this.index) {
        throw new Error(`${m}\n\n${this.s}\n${" ".repeat(i)}\u25B2\n${"\u2500".repeat(i)}\u256F`);
    }
}
exports.default = Tokenizer;
function isDigit(c) {
    return (c === "0" ||
        c === "1" ||
        c === "2" ||
        c === "3" ||
        c === "4" ||
        c === "5" ||
        c === "6" ||
        c === "7" ||
        c === "8" ||
        c === "9");
}
exports.isDigit = isDigit;
function isLetter(s) {
    return (typeof s === "string" &&
        s.length === 1 &&
        ((s.charCodeAt(0) >= 97 && s.charCodeAt(0) < 123) ||
            (s.charCodeAt(0) >= 65 && s.charCodeAt(0) < 91)));
}
exports.isLetter = isLetter;
function isIdentChar(s) {
    return isLetter(s) || isDigit(s) || s === "$" || s === "_";
}
exports.isIdentChar = isIdentChar;
