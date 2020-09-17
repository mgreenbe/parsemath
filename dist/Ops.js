"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBinOp = exports.isUnOp = exports.unOp = exports.binOp = exports.fixity = exports.assoc = exports.prec = void 0;
exports.prec = {
    "=": 0,
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "u+": 3,
    "u-": 3,
    "^": 4,
    "**": 4,
};
exports.assoc = {
    "+": "left",
    "u+": "right",
    "-": "left",
    "u-": "right",
    "*": "left",
    "/": "left",
    "^": "right",
    "**": "right",
    "=": "left",
};
exports.fixity = {
    "+": "infix",
    "u+": "prefix",
    "-": "infix",
    "u-": "prefix",
    "*": "infix",
    "/": "infix",
    "^": "infix",
    "**": "infix",
    "=": "infix",
};
function binOp(op, x, y) {
    switch (op) {
        case "+":
            return x + y;
        case "-":
            return x - y;
        case "*":
            return x * y;
        case "/":
            return x / y;
        case "^":
        case "**":
            return Math.pow(x, y);
        case "=":
            return Math.abs(x - y) < 1e-8 ? 1 : 0;
        default:
            throw new Error(`Unknown binary operation: ${op}`);
    }
}
exports.binOp = binOp;
function unOp(op, x) {
    switch (op) {
        case "u+":
            return x;
        case "u-":
            return -x;
        default:
            throw new Error(`Unknown binary operation: ${op}`);
    }
}
exports.unOp = unOp;
function isUnOp(s) {
    return s === "u+" || s === "u-";
}
exports.isUnOp = isUnOp;
function isBinOp(c) {
    return (c === "+" ||
        c === "-" ||
        c === "*" ||
        c === "/" ||
        c === "^" ||
        c === "**" ||
        c === "=");
}
exports.isBinOp = isBinOp;
