"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtInFuns = void 0;
const Matrix_1 = __importDefault(require("./Matrix"));
exports.builtInFuns = {
    abs: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.abs),
    },
    exp: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.exp),
    },
    sqrt: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.sqrt),
    },
    min: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.min),
    },
    max: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.max),
    },
    cos: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.cos),
    },
    sin: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.sin),
    },
    atan: {
        nargs: 1,
        apply: Matrix_1.default.lift(Math.atan),
    },
    atan2: {
        nargs: 2,
        apply: Matrix_1.default.lift(Math.atan2),
    },
    dot: {
        nargs: 2,
        apply: Matrix_1.default.dot,
    },
};
