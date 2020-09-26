"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mattrix_1 = __importDefault(require("mattrix"));
const op = (startPos, op) => {
    return { type: "OP", startPos, name: op };
};
const value = (startPos, value) => {
    return { type: "VALUE", startPos, value };
};
const ident = (startPos, name) => {
    return { type: "IDENT", startPos, name };
};
const lParen = (startPos) => {
    return { type: "LPAREN", startPos };
};
const rParen = (startPos) => {
    return { type: "RPAREN", startPos };
};
const lBrak = (startPos) => {
    return { type: "LBRAK", startPos };
};
const rBrak = (startPos) => {
    return { type: "RBRAK", startPos };
};
const NUM_RE = /^\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/;
const IDENT_RE = /^[a-zA-Z]\w*/;
class TokenStack {
    constructor(src) {
        this.pos = 0;
        this.buf = [];
        this.cur = undefined;
        this.last = undefined;
        this.src = src;
    }
    push(t) {
        this.buf.push(t);
    }
    pop() {
        if (this.cur) {
            this.last = this.cur;
        }
        if (this.buf.length > 0) {
            this.cur = this.buf.pop();
            return this.cur;
        }
        this.skipWhitespace();
        let ch = this.src[this.pos];
        if (ch === undefined) {
            this.cur = undefined;
            return this.cur;
        }
        else if (ch === "(") {
            this.cur = lParen(this.pos++);
            return this.cur;
        }
        else if (ch === "[") {
            this.cur = lBrak(this.pos++);
            return this.cur;
        }
        else if (ch === ")") {
            if (!this.last) {
                throw new Error(`Expression starts with ')'`);
            }
            this.cur = rParen(this.pos++);
            return this.cur;
        }
        else if (ch === "]") {
            if (!this.last) {
                throw new Error(`Expression starts with ']'`);
            }
            else if (this.last.type === "LPAREN") {
                throw new Error(`Empty brackets.`);
            }
            this.cur = rBrak(this.pos++);
            return this.cur;
        }
        else if (ch === "*" ||
            ch === "/" ||
            ch === "^" ||
            ch === "=" ||
            ch === "," ||
            ch === ";") {
            this.cur = op(this.pos++, ch);
            return this.cur;
        }
        else if (ch === "+" || ch === "-") {
            if (this.last === undefined ||
                this.last.type === "LPAREN" ||
                this.last.type === "OP") {
                this.cur = op(this.pos++, ch === "+" ? "u+" : "u-");
                return this.cur;
            }
            else {
                this.cur = op(this.pos++, ch);
                return this.cur;
            }
        }
        else if ("0123456789".includes(ch)) {
            let match = NUM_RE.exec(this.src.slice(this.pos));
            if (match === null) {
                throw new Error("This shouldn't have happened!");
            }
            let startPos = this.pos;
            this.pos += match[0].length;
            let m = mattrix_1.default.fromNumber(Number(match[0]));
            this.cur = value(startPos, m);
            return this.cur;
        }
        else if ((ch.charCodeAt(0) >= 65 && ch.charCodeAt(0) < 91) ||
            (ch.charCodeAt(0) >= 97 && ch.charCodeAt(0) < 123)) {
            let match = IDENT_RE.exec(this.src.slice(this.pos));
            if (match === null) {
                throw new Error("This shouldn't have happened!");
            }
            this.cur = ident(this.pos, match[0]);
            this.pos += match[0].length;
            return this.cur;
        }
        else {
            throw new Error(`Uexpected character: ${ch}`);
        }
    }
    skipWhitespace() {
        var _a;
        while (((_a = this.src[this.pos]) === null || _a === void 0 ? void 0 : _a.trim()) === "") {
            this.pos++;
        }
    }
}
exports.default = TokenStack;
