"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const Ops_1 = require("./Ops");
const Tokenizer_1 = __importDefault(require("./Tokenizer"));
function parse(s, scope = {}, fns = {}) {
    const allowedIdents = [...Object.keys(scope), ...Object.keys(fns)];
    const ts = Tokenizer_1.default(s, allowedIdents);
    const ops = [];
    const vals = [];
    let index = 0;
    while (index < ts.length) {
        const t = ts[index++];
        switch (t[0]) {
            case "Num":
                vals.push(t[1]);
                break;
            case "Ident":
                if (t[1] in scope) {
                    vals.push(scope[t[1]]);
                }
                else if (t[1] in fns) {
                    ops.push(t);
                }
                break;
            case "LParen":
                ops.push(t);
                break;
            case "RParen":
                {
                    const op = ops.pop();
                    if (op === undefined) {
                        throwError(`Unmatched ')' at ${t[2]}.`, t);
                    }
                    if (op[0] === "Ident") {
                    }
                    else if (op[0] !== "LParen") {
                        evalOp(op);
                        index--;
                    }
                }
                break;
            case "UnOp":
            case "BinOp":
                {
                    const op = ops.pop();
                    if (op === undefined) {
                        ops.push(t);
                    }
                    else if (op[0] === "LParen") {
                        ops.push(op, t);
                    }
                    else if (op[0] === "Ident") {
                    }
                    else if (Ops_1.prec[t[1]] > Ops_1.prec[op[1]] ||
                        (Ops_1.prec[t[1]] === Ops_1.prec[op[1]] && Ops_1.assoc[t[1]] === "right") ||
                        (Ops_1.prec[t[1]] <= Ops_1.prec[op[1]] &&
                            Ops_1.isUnOp(t[1]) &&
                            Ops_1.fixity[t[1]] === "prefix")) {
                        ops.push(op, t);
                    }
                    else {
                        index--;
                        evalOp(op);
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
    while ((op = ops.pop())) {
        if (op[0] === "LParen") {
            throwError(`Unmatched '(' at position ${op[2]}.`, op);
            // throw new Error("Unexpected '('.");
        }
        else if (op[0] === "Ident") {
            evalOp(op);
        }
        else {
            evalOp(op);
        }
    }
    console.assert(vals.length === 1);
    return vals[0];
    function evalOp(op) {
        if (op[0] === "Ident") {
            const x = vals.pop();
            if (x === undefined) {
                throwError("Unspecified parsing error.");
            }
            vals.push(fns[op[1]](x));
        }
        else if (Ops_1.isBinOp(op[1])) {
            const y = vals.pop();
            const x = vals.pop();
            if (x === undefined || y === undefined) {
                throwError("Unspecified parsing error.");
            }
            vals.push(Ops_1.binOp(op[1], x, y));
        }
        else {
            // unary op
            const x = vals.pop();
            if (x === undefined) {
                throwError(`Expected argument of ${op[1]}`, op);
            }
            vals.push(Ops_1.unOp(op[1], x));
        }
    }
    function throwError(m, t) {
        if (t === undefined) {
            throw new Error(m);
        }
        else {
            throw new Error(`${m}\n\n${s}\n${" ".repeat(t[2])}\u25B2\n${t && "\u2500".repeat(t[2])}\u256F`);
        }
    }
}
exports.parse = parse;
