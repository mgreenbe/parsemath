import Matrix from "./Matrix";
export declare type Op = "+" | "-" | "*" | "/" | "u-" | "u+" | "^" | "=" | "," | ";";
interface OpRec {
    apply: (...Xs: Matrix[]) => Matrix;
    [key: string]: any;
}
export declare const opData: Record<string, OpRec>;
export declare let builtInFuns: Record<string, FunRec>;
export declare type Fun = (...args: Matrix[]) => Matrix;
export declare type FunRec = {
    nargs: number;
    apply: Fun;
};
export {};
