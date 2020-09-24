import TokenStack, { IdentTok, OpTok, LParenTok, LBrakTok } from "./TokenStack";
import Matrix from "./Matrix";
import { builtInFuns, Fun, FunRec } from "./Functions";
export { builtInFuns };
export declare class Parser {
    tokenStack: TokenStack;
    valStack: (Matrix | Matrix[])[];
    opStack: (OpTok | LParenTok | LBrakTok | IdentTok)[];
    vars: Record<string, Matrix>;
    funs: Record<string, FunRec>;
    nesting: ("GROUP" | "ARGLIST" | "VECTOR")[];
    constructor(src: string, vars?: Record<string, number | Matrix>, funs?: Record<string, FunRec>);
    parse(): Matrix;
    popOps(): LParenTok | LBrakTok | undefined;
    applyFun(t: IdentTok): void;
    applyOp(t: OpTok): void;
}
export declare function parse(expr: string, scope?: Record<string, number | Matrix>, funs?: Record<string, {
    nargs: number;
    apply: Fun;
}>): Matrix;
