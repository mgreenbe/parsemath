declare type NumTok = {
    type: "NUM";
    startPos: number;
    endPos: number;
    value: number;
};
declare type LParenTok = {
    type: "LPAREN";
    startPos: number;
    endPos: number;
    value: "(";
};
declare type RParenTok = {
    type: "RPAREN";
    startPos: number;
    endPos: number;
    value: ")";
};
declare type OpTok = {
    type: "OP";
    startPos: number;
    endPos: number;
    value: Op;
};
declare type Token = NumTok | LParenTok | RParenTok | OpTok;
interface OperatorProps {
    arity: number;
    prec: number;
    fixity: "PREFIX" | "INFIX" | "POSTFIX";
    assoc: "LTR" | "RTL";
    apply: (...args: number[]) => number;
}
declare type Op = "+" | "-" | "*" | "/" | "u-" | "u+";
declare const opData: Record<Op, OperatorProps>;
declare const lParen: (startPos: number) => Token;
declare const rParen: (startPos: number) => Token;
declare const op: (startPos: number, value: Op) => Token;
declare const num: (startPos: number, endPos: number, value: number) => Token;
declare type Mode = "EXPR";
declare const NUMBER_RE: RegExp;
declare class Parser {
    src: string;
    pos: number;
    lastTok: Token | undefined;
    tokStack: Token[];
    valStack: number[];
    opStack: (Op | "(")[];
    constructor(src: string);
    parse(): number;
    apply(op: Op): void;
    getToken(): Token | undefined;
    skipWhitespace(): void;
}
declare let P: Parser;
