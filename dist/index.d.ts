import { OpTok, LParenTok, Scope, Tok } from "./Types";
export default class Parser {
    s: string;
    scope: Scope;
    ts: Tok[];
    index: number;
    ops: (OpTok | LParenTok)[];
    vals: number[];
    constructor(s: string, scope?: Scope);
    parse(): number;
    evalOp(op: OpTok): void;
    throwError(m: string, t?: Tok): never;
}
