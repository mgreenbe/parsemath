import { Tok, TokType } from "./Types";
export default class Tokenizer {
    s: string;
    index: number;
    allowedIdents: string[];
    constructor(s: string, allowedIdents?: string[]);
    tokenize(): Tok[];
    skipWhitespace(): void;
    scanNumber(): [number, number];
    scanIdent(): [string, number];
    isValidTokCharOrder(prev: Tok | undefined, tokType: TokType, cur: string): true;
    throwError(m: string, i?: number): never;
}
export declare function isDigit(c: unknown): boolean;
export declare function isLetter(s: unknown): boolean;
export declare function isIdentChar(s: unknown): boolean;
