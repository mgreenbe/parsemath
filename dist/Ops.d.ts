import { Op, UnOp, BinOp, Associativity as Assoc, Precedence as Prec, Fixity as Fix } from "./Types";
export declare const prec: Record<Op, Prec>;
export declare const assoc: Record<Op, Assoc>;
export declare const fixity: Record<Op, Fix>;
export declare function binOp(op: BinOp, x: number, y: number): number;
export declare function unOp(op: UnOp, x: number): number;
export declare function isUnOp(s: string): s is UnOp;
export declare function isBinOp(c: string): c is BinOp;
