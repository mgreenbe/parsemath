export class Vector extends Array<number> {
  static isVector(x: unknown): x is Vector {
    return x instanceof Vector && Array.isArray(x);
  }

  plus(y: Vector): Vector {
    if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => xi + y[i]));
    } else {
      throw new Error("Terms have incompatible sizes.");
    }
  }

  minus(y: Vector): Vector {
    if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => xi - y[i]));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  stimes(y: number): Vector {
    return new Vector(...this.map((xi) => xi * y));
  }

  sdiv(y: number): Vector {
    return new Vector(...this.map((xi) => xi / y));
  }

  dtimes(y: Vector): number {
    if (y.length === this.length) {
      let ans = 0;
      for (let i = 0; i < this.length; i++) {
        ans += this[i] * y[i];
      }
      return ans;
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  equals(y: Vector, eps = 1e-8): boolean {
    return (
      this.length === y.length &&
      this.map((xi, i) => Math.abs(xi - y[i]) < eps).every((x) => x)
    );
  }
}

export type NumTok = ["Num", number, number];
export type UnOp = "u+" | "u-";
export type UnOpTok = ["UnOp", UnOp, number];
export type BinOp = "+" | "-" | "*" | "/" | "^" | "**" | "=";
export type BinOpTok = ["BinOp", BinOp, number];
export type Op = UnOp | BinOp;
export type OpTok = UnOpTok | BinOpTok;
export type LParenTok = ["LParen", "(", number];
export type RParenTok = ["RParen", ")", number];
export type IdentTok = ["Ident", string, number];
export type Tok = NumTok | OpTok | LParenTok | RParenTok | IdentTok;
export type TokType = "Num" | "UnOp" | "BinOp" | "LParen" | "RParen" | "Ident";

export type Precedence = 0 | 1 | 2 | 3 | 4;
export type Associativity = "left" | "right";
export type Arity = 1 | 2;
export type Fixity = "prefix" | "infix";

export type Scope = { [ident: string]: number | Vector };
