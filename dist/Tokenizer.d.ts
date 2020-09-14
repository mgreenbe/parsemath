import { Tok } from "./Types";
export default function tokenize(s: string, allowedIdents: string[]): Tok[];
export declare function isDigit(c: unknown): boolean;
export declare function isLetter(s: unknown): boolean;
export declare function isIdentChar(s: unknown): boolean;
