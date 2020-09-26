import Matrix from "mattrix";
export declare type Fun = (...args: Matrix[]) => Matrix;
export declare type FunRec = {
    nargs: number;
    apply: Fun;
};
export declare let builtInFuns: Record<string, FunRec>;
