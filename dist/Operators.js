"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.opData = void 0;
const Matrix_1 = __importDefault(require("./Matrix"));
exports.opData = {
    //   ",": { arity: 2, prec: 0, fixity: "INFIX", assoc: "LTR" },
    "=": {
        arity: 2,
        prec: 1,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.equals,
    },
    "+": {
        arity: 2,
        prec: 2,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.plus,
    },
    "-": {
        arity: 2,
        prec: 2,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.minus,
    },
    "*": {
        arity: 2,
        prec: 3,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.times,
    },
    "/": {
        arity: 2,
        prec: 3,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.divide,
    },
    "u+": {
        arity: 1,
        prec: 4,
        fixity: "PREFIX",
        assoc: "RTL",
        apply: (X) => X,
    },
    "u-": {
        arity: 1,
        prec: 4,
        fixity: "PREFIX",
        assoc: "RTL",
        apply: Matrix_1.default.neg,
    },
    "^": {
        arity: 2,
        prec: 5,
        fixity: "INFIX",
        assoc: "RTL",
        apply: Matrix_1.default.pow,
    },
    ",": {
        arity: 2,
        prec: 1,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.hJoin,
    },
    ";": {
        arity: 2,
        prec: 0,
        fixity: "INFIX",
        assoc: "LTR",
        apply: Matrix_1.default.vJoin,
    },
};
