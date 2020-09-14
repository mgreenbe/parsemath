"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ops_1 = require("./Ops");
const Tokenizer2_1 = __importDefault(require("./Tokenizer2"));
class Parser {
    constructor(s, scope = {}) {
        this.index = 0;
        this.ops = [];
        this.vals = [];
        this.s = s;
        this.scope = scope;
        const allowedIdents = Object.keys(scope);
        // const tokenizer = new Tokenizer(s, allowedIdents);
        this.ts = Tokenizer2_1.default(s, allowedIdents);
    }
    parse() {
        while (this.index < this.ts.length) {
            const t = this.ts[this.index++];
            switch (t[0]) {
                case "Num":
                    this.vals.push(t[1]);
                    break;
                case "Ident":
                    this.vals.push(this.scope[t[1]]);
                    break;
                case "LParen":
                    this.ops.push(t);
                    break;
                case "RParen":
                    {
                        const op = this.ops.pop();
                        if (op === undefined) {
                            this.throwError(`Unmatched ')' at ${t[2]}.`, t);
                        }
                        if (op[0] !== "LParen") {
                            this.evalOp(op);
                            this.index--;
                        }
                    }
                    break;
                case "UnOp":
                case "BinOp":
                    {
                        const op = this.ops.pop();
                        if (op === undefined) {
                            this.ops.push(t);
                        }
                        else if (op[0] === "LParen") {
                            this.ops.push(op, t);
                        }
                        else if (Ops_1.prec[t[1]] > Ops_1.prec[op[1]] ||
                            (Ops_1.prec[t[1]] === Ops_1.prec[op[1]] && Ops_1.assoc[t[1]] === "right") ||
                            (Ops_1.prec[t[1]] <= Ops_1.prec[op[1]] &&
                                Ops_1.isUnOp(t[1]) &&
                                Ops_1.fixity[t[1]] === "prefix")) {
                            this.ops.push(op, t);
                        }
                        else {
                            this.index--;
                            this.evalOp(op);
                        }
                    }
                    break;
                default:
                    throw new Error("This shouldn't happen!");
            }
        }
        // All tokens processed.
        // Clear out operation and value stacks.
        let op;
        while ((op = this.ops.pop())) {
            if (op[0] === "LParen") {
                this.throwError(`Unmatched '(' at position ${op[2]}.`, op);
                // throw new Error("Unexpected '('.");
            }
            else {
                this.evalOp(op);
            }
        }
        console.assert(this.vals.length === 1);
        return this.vals[0];
    }
    evalOp(op) {
        if (Ops_1.isBinOp(op[1])) {
            const y = this.vals.pop();
            const x = this.vals.pop();
            if (x === undefined || y === undefined) {
                this.throwError("Unspecified parsing error.");
            }
            this.vals.push(Ops_1.binOp(op[1], x, y));
        }
        else {
            // unary op
            const x = this.vals.pop();
            if (x === undefined) {
                this.throwError(`Expected argument of ${op[1]}`, op);
            }
            this.vals.push(Ops_1.unOp(op[1], x));
        }
    }
    throwError(m, t) {
        if (t === undefined) {
            throw new Error(m);
        }
        else {
            throw new Error(`${m}\n\n${this.s}\n${" ".repeat(t[2])}\u25B2\n${t && "\u2500".repeat(t[2])}\u256F`);
        }
    }
}
exports.default = Parser;
