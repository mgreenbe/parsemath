export type Row = number[]
export type UnOp = 'u+' | 'u-'
export type BinOp = '+' | '-' | '*' | '/' | '^' | '**' | '='
export type Op = UnOp | BinOp

export type RowTok = ['Row', Row, number]
export type NumTok = ['Num', number, number]
export type UnOpTok = ['UnOp', UnOp, number]
export type BinOpTok = ['BinOp', BinOp, number]
export type OpTok = UnOpTok | BinOpTok
export type LParenTok = ['LParen', '(', number]
export type RParenTok = ['RParen', ')', number]
export type LBrakTok = ['LBrak', '[', number]
export type RBrakTok = ['RBrak', ']', number]
export type IdentTok = ['Ident', string, number]
export type Tok =
  | NumTok
  | OpTok
  | LParenTok
  | RParenTok
  | LBrakTok
  | RBrakTok
  | IdentTok
  | RowTok

export type TokType =
  | 'Row'
  | 'Num'
  | 'UnOp'
  | 'BinOp'
  | 'LParen'
  | 'RParen'
  | 'LBrak'
  | 'RBrak'
  | 'Ident'

export type Precedence = 0 | 1 | 2 | 3 | 4
export type Associativity = 'left' | 'right'
export type Arity = 1 | 2
export type Fixity = 'prefix' | 'infix'

export type Scope = { [ident: string]: number }
