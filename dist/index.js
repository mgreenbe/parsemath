"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.Parser = exports.builtInFuns = void 0;
const TokenStack_1 = __importDefault(require("./TokenStack"));
const Matrix_1 = __importDefault(require("./Matrix"));
const BuiltIns_1 = require("./BuiltIns");
Object.defineProperty(exports, "builtInFuns", { enumerable: true, get: function () { return BuiltIns_1.builtInFuns; } });
class Parser {
    constructor(src, vars = {}, funs = BuiltIns_1.builtInFuns) {
        this.valStack = [];
        this.opStack = [];
        this.nesting = [];
        this.tokenStack = new TokenStack_1.default(src);
        this.vars = Object.fromEntries(Object.entries(vars).map(([key, value]) => [
            key,
            typeof value === "number" ? Matrix_1.default.fromNumber(value) : value,
        ]));
        this.funs = funs;
    }
    parse() {
        let t;
        while ((t = this.tokenStack.pop())) {
            switch (t.type) {
                case "VALUE":
                    this.valStack.push(t.value);
                    break;
                case "IDENT":
                    {
                        let value = this.vars[t.name];
                        if (value !== undefined) {
                            this.valStack.push(value);
                        }
                        else {
                            if (this.funs[t.name] === undefined) {
                                throw new Error(`Unknown identifier ${t.name} at position ${t.startPos}`);
                            }
                            let tt = this.tokenStack.pop();
                            if (tt === undefined) {
                                throw new Error(`Unexpected end of input at position ${t.startPos + t.name.length}`);
                            }
                            else if (tt.type !== "LPAREN") {
                                throw new Error(`Expected '(' at position ${t.startPos + t.name.length}`);
                            }
                            this.opStack.push(t);
                            this.opStack.push(tt);
                            this.nesting.push("ARGLIST");
                        }
                    }
                    break;
                case "LPAREN":
                    this.opStack.push(t);
                    this.nesting.push("GROUP");
                    break;
                case "LBRAK":
                    this.opStack.push(t);
                    this.nesting.push("VECTOR");
                    break;
                case "RPAREN":
                case "RBRAK": {
                    let op = this.popOps();
                    if (op === undefined) {
                        throw new Error(`Unmatched ')' or ']': ${JSON.stringify(t)}`);
                    }
                    this.nesting.pop();
                    break;
                }
                case "OP":
                    {
                        let tt = this.opStack.pop();
                        if (tt === undefined) {
                            this.opStack.push(t);
                        }
                        else if (tt.type === "IDENT") {
                            this.tokenStack.push(t);
                            this.applyFun(tt);
                        }
                        else if (tt.type === "LPAREN" || tt.type === "LBRAK") {
                            this.opStack.push(tt, t);
                        }
                        else {
                            let { prec: tprec, arity: tarity, assoc: tassoc } = BuiltIns_1.opData[t.name];
                            let { prec: ttprec, arity: ttarity, assoc: ttassoc } = BuiltIns_1.opData[tt.name];
                            if (tprec > ttprec || (tarity === 1 && ttarity === 2)) {
                                this.opStack.push(tt, t);
                            }
                            else if (tprec < ttprec) {
                                this.tokenStack.push(t);
                                this.applyOp(tt);
                            }
                            else {
                                // equal precedence
                                if (tassoc !== ttassoc) {
                                    throw new Error(`All operators with the same precedence must have the same associativity.`);
                                }
                                else if (tassoc === "RTL") {
                                    this.opStack.push(tt, t);
                                }
                                else {
                                    this.tokenStack.push(t);
                                    this.applyOp(tt);
                                }
                            }
                        }
                    }
                    break;
                default:
                    throw new Error(`Unknown token: ${t}`);
            }
        }
        // Apply all remaining ops.
        let op = this.popOps();
        if ((op === null || op === void 0 ? void 0 : op.type) === "LPAREN") {
            throw new Error(`Unmatched '(': ${JSON.stringify(op)}`);
        }
        if (this.nesting.length > 1) {
            throw new Error(`nesting = ${this.nesting}`);
        }
        // Check no values left over.
        if (this.valStack.length === 1 && this.valStack[0] instanceof Matrix_1.default) {
            return this.valStack[0];
        }
        else {
            throw new Error("Unspecified parsing error!");
        }
    }
    popOps() {
        let op;
        while ((op = this.opStack.pop())) {
            if (op.type === "LPAREN" || op.type === "LBRAK") {
                return op;
            }
            else if (op.type === "IDENT") {
                this.applyFun(op);
            }
            else {
                this.applyOp(op);
            }
        }
        return op;
    }
    applyFun(t) {
        let f = this.funs[t.name];
        if (f === undefined) {
            throw new Error(`Unknown function: ${t.name}\n**This shouldn't happen!**`);
        }
        let arg = this.valStack.pop();
        let result;
        if (arg === undefined) {
            if (f.nargs === 0) {
                result = f.apply();
            }
            else {
                throw new Error(`The function ${t.name} takes ${f.nargs} arguments. You provided 0.`);
            }
        }
        else if (arg instanceof Matrix_1.default) {
            if (f.nargs === 1) {
                result = f.apply(arg);
            }
            else {
                throw new Error(`The function ${t.name} takes ${f.nargs} arguments. You provided 1.`);
            }
        }
        else {
            if (f.nargs === arg.length) {
                result = f.apply(...arg);
            }
            else {
                throw new Error(`The function ${t.name} takes ${f.nargs} arguments. You provided ${arg.length}.`);
            }
        }
        this.valStack.push(result);
    }
    applyOp(t) {
        switch (t.name) {
            case "u+":
            case "u-": {
                let x = this.valStack.pop();
                if (x === undefined) {
                    throw new Error(`Not enough arguments for ${t.name}.`);
                }
                else if (x instanceof Matrix_1.default) {
                    let result = BuiltIns_1.opData[t.name].apply(x);
                    this.valStack.push(result);
                }
                else {
                    throw new Error(`Can't apply ${t.name} to ${x}.`);
                }
                break;
            }
            case "+":
            case "-":
            case "*":
            case "/":
            case "^":
            case "=":
            case ",":
            case ";": {
                let y = this.valStack.pop();
                let x = this.valStack.pop();
                if (t.name !== "," ||
                    this.nesting[this.nesting.length - 1] === "VECTOR") {
                    if (x === undefined || y === undefined) {
                        throw new Error(`Not enough arguments for ${t.name}.`);
                    }
                    else if (Array.isArray(x) || Array.isArray(y)) {
                        throw new Error(`An argument list shouldn't be here.\n**This shouldn't have happened!**`);
                    }
                    else {
                        let result = BuiltIns_1.opData[t.name].apply(x, y);
                        this.valStack.push(result);
                    }
                    break;
                }
                else {
                    if (x === undefined || y === undefined) {
                        throw new Error(`Not enough arguments for ${t.name}.`);
                    }
                    else {
                        let xx = x instanceof Matrix_1.default ? [x] : x;
                        let yy = y instanceof Matrix_1.default ? [y] : y;
                        this.valStack.push([...xx, ...yy]);
                    }
                }
                break;
            }
            default: {
                throw new Error(`Unknown operation: '${t}'`);
            }
        }
    }
}
exports.Parser = Parser;
function parse(expr, scope, funs) {
    let P = new Parser(expr, scope, funs);
    return P.parse();
}
exports.parse = parse;
// parse(
//   "[sin(pi),cos(pi), pi*0.5]=[1,0,pi/2]",
//   { pi: Math.PI / 2 },
//   builtInFuns
// ).log();
