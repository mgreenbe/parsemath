"use strict";
//   | "**"
//   | "^"
//   | "=="
//   | "<"
//   | ">"
//   | "<="
//   | ">="
//   | "&&"
//   | "||";
const opData = {
    //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
    "+": {
        arity: 2,
        prec: 1,
        fixity: "INFIX",
        assoc: "LTR",
        apply: (x, y) => x + y,
    },
    "-": {
        arity: 2,
        prec: 1,
        fixity: "INFIX",
        assoc: "LTR",
        apply: (x, y) => x - y,
    },
    "*": {
        arity: 2,
        prec: 2,
        fixity: "INFIX",
        assoc: "LTR",
        apply: (x, y) => x * y,
    },
    "/": {
        arity: 2,
        prec: 2,
        fixity: "INFIX",
        assoc: "LTR",
        apply: (x, y) => x / y,
    },
    "u+": { arity: 1, prec: 3, fixity: "PREFIX", assoc: "RTL", apply: (x) => x },
    "u-": { arity: 1, prec: 3, fixity: "PREFIX", assoc: "RTL", apply: (x) => -x },
};
const lParen = (startPos) => {
    return { type: "LPAREN", startPos, endPos: startPos + 1, value: "(" };
};
const rParen = (startPos) => {
    return { type: "RPAREN", startPos, endPos: startPos + 1, value: ")" };
};
const op = (startPos, value) => {
    return { type: "OP", startPos, endPos: startPos + value.length, value };
};
const num = (startPos, endPos, value) => {
    return { type: "NUM", startPos, endPos, value };
};
const NUMBER_RE = /^\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/;
class Parser {
    //   mode: Mode = "EXPR";
    constructor(src) {
        this.pos = 0;
        this.tokStack = [];
        this.valStack = [];
        this.opStack = [];
        this.src = src;
    }
    parse() {
        let t;
        while ((t = this.getToken())) {
            console.log(t);
            if (t.type === "NUM") {
                this.valStack.push(t.value);
            }
            else if (t.type === "LPAREN") {
                this.opStack.push("(");
            }
            else if (t.type === "OP") {
                let topOp = this.opStack.pop();
                if (topOp === undefined) {
                    this.opStack.push(t.value);
                }
                else if (topOp === "(") {
                    throw new Error(`Unmatched "(".`);
                }
                else if (opData[t.value].prec > opData[topOp].prec) {
                    this.opStack.push(topOp, t.value);
                }
                else if (opData[t.value].prec < opData[topOp].prec) {
                    this.tokStack.push(t);
                    this.apply(topOp);
                }
                else {
                    // equal precedence
                    if (opData[t.value].assoc !== opData[topOp].assoc) {
                        throw new Error(`All operators with the same precedence must have the same associativity.`);
                    }
                    else if (opData[t.value].assoc === "RTL") {
                        this.opStack.push(topOp, t.value);
                    }
                    else {
                        this.tokStack.push(t);
                        this.apply(topOp);
                    }
                }
            }
            this.lastTok = t;
            console.log(t, this.valStack, this.opStack, this.tokStack);
        }
        console.log(this.valStack, this.opStack);
        let op;
        while ((op = this.opStack.pop())) {
            if (op === "(") {
                throw new Error(`Unmatched "(".`);
            }
            else {
                this.apply(op);
            }
            console.log(this.valStack, this.opStack);
        }
        return 0;
    }
    apply(op) {
        let args = [];
        for (let i = 0; i < opData[op].arity; i++) {
            let arg = this.valStack.pop();
            if (arg === undefined) {
                throw new Error(`Insufficient arguments for ${op}.`);
            }
            args.push(arg);
        }
        this.valStack.push(opData[op].apply(...args));
    }
    getToken() {
        if (this.tokStack.length > 0) {
            return this.tokStack.pop();
        }
        this.skipWhitespace();
        let ch = this.src[this.pos];
        if (ch === undefined) {
            return undefined;
        }
        else if (ch === "(") {
            return lParen(this.pos++);
        }
        else if (ch === ")") {
            return rParen(this.pos++);
        }
        else if (ch === "*" || ch === "/") {
            return op(this.pos++, ch);
        }
        else if (ch === "+" || ch === "-") {
            if (this.lastTok === undefined ||
                this.lastTok.type === "LPAREN" ||
                this.lastTok.type === "OP") {
                return op(this.pos++, ch === "+" ? "u+" : "u-");
            }
        }
        else if ("0123456789".includes(ch)) {
            let match = NUMBER_RE.exec(this.src.slice(this.pos));
            if (match === null) {
                throw new Error("This shouldn't have happened!");
            }
            let startPos = this.pos;
            this.pos += match[0].length;
            return num(startPos, this.pos, Number(match[0]));
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
let P = new Parser("-11+2/2");
P.parse();
// let t: Token | undefined;
// while ((t = P.getToken())) {
//   console.log(t);
// }
