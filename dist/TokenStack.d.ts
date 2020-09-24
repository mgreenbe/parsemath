import { Op } from "./BuiltIns";
import Matrix from "./Matrix";
export declare type Token = ValueTok | IdentTok | OpTok | LParenTok | RParenTok | LBrakTok | RBrakTok;
export declare type ValueTok = {
    type: "VALUE";
    startPos: number;
    value: Matrix;
};
export declare type IdentTok = {
    type: "IDENT";
    startPos: number;
    name: string;
};
export declare type OpTok = {
    type: "OP";
    startPos: number;
    name: Op;
};
export declare type LParenTok = {
    type: "LPAREN";
    startPos: number;
};
export declare type RParenTok = {
    type: "RPAREN";
    startPos: number;
};
export declare type LBrakTok = {
    type: "LBRAK";
    startPos: number;
};
export declare type RBrakTok = {
    type: "RBRAK";
    startPos: number;
};
export default class TokenStack {
    src: string;
    pos: number;
    buf: Token[];
    cur: Token | undefined;
    last: Token | undefined;
    constructor(src: string);
    push(t: Token): void;
    pop(): Token | undefined;
    skipWhitespace(): void;
}
