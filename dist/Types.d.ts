export declare type NumTok = ["Num", number, number];
export declare type UnOp = "u+" | "u-";
export declare type UnOpTok = ["UnOp", UnOp, number];
export declare type BinOp = "+" | "-" | "*" | "/" | "^" | "**" | "=";
export declare type BinOpTok = ["BinOp", BinOp, number];
export declare type Op = UnOp | BinOp;
export declare type OpTok = UnOpTok | BinOpTok;
export declare type LParenTok = ["LParen", "(", number];
export declare type RParenTok = ["RParen", ")", number];
export declare type IdentTok = ["Ident", string, number];
export declare type Tok = NumTok | OpTok | LParenTok | RParenTok | IdentTok;
export declare type TokType = "Num" | "UnOp" | "BinOp" | "LParen" | "RParen" | "Ident";
export declare type Precedence = 0 | 1 | 2 | 3 | 4;
export declare type Associativity = "left" | "right";
export declare type Arity = 1 | 2;
export declare type Fixity = "prefix" | "infix";
export declare type Scope = {
    [ident: string]: number;
};
