export const prec = {
    "=": 0,
    "+": 1,
    "-": 1,
    "u+": 2,
    "u-": 2,
    "*": 3,
    "/": 3,
    "^": 4,
    "**": 4,
};
export const assoc = {
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
export const fixity = {
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
export function binOp(op, x, y) {
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
export function unOp(op, x) {
    switch (op) {
        case "u+":
            return x;
        case "u-":
            return -x;
        default:
            throw new Error(`Unknown binary operation: ${op}`);
    }
}
export function isUnOp(s) {
    return s === "u+" || s === "u-";
}
export function isBinOp(c) {
    return (c === "+" ||
        c === "-" ||
        c === "*" ||
        c === "/" ||
        c === "^" ||
        c === "**" ||
        c === "=");
}
