export class Vector extends Array<number> {
  static isVector(x: unknown): x is Vector {
    return x instanceof Vector && Array.isArray(x);
  }

  all(eps = 1e-8): boolean {
    return this.every((xi) => Math.abs(xi) > eps);
  }

  any(eps = 1e-8): boolean {
    return this.some((xi) => Math.abs(xi) > eps);
  }

  plus(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => xi + y));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => xi + y[i]));
    } else {
      throw new Error("Terms have incompatible sizes.");
    }
  }

  minus(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => xi - y));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => xi - y[i]));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  times(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => xi * y));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => xi * y[i]));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  divide(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => xi / y));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => xi / y[i]));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  under(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => y / xi));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => y[i] / xi));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  power(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => Math.pow(xi, y)));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => Math.pow(xi, y[i])));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  expBase(y: number | Vector): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => Math.pow(y, xi)));
    } else if (y.length === this.length) {
      return new Vector(...this.map((xi, i) => Math.pow(y[i], x[i])));
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  equals(y: number | Vector, eps = 1e-8): Vector {
    if (typeof y === "number") {
      return new Vector(...this.map((xi) => (Math.abs(xi - y) < eps ? 1 : 0)));
    } else if (y.length === this.length) {
      return new Vector(
        ...this.map((xi, i) => (Math.abs(xi - y[i]) < eps ? 1 : 0))
      );
    } else {
      throw new Error("Arguments have incompatible sizes.");
    }
  }

  tex(options: Options = {}): string {
    if (options.format === "point") {
      return `(${this.join(",")})`;
    } else {
      const left =
        options.delims === "p" ? "\\begin{pmatrix}" : "\\begin{bmatrix}";
      const right =
        options.delims === "p" ? "\\end{pmatrix}" : "\\end{bmatrix}";
      const sep = options.format === "col" ? "\\\\" : "&";
      return left + this.join(sep) + right;
    }
  }
}

interface Options {
  format?: "row" | "col" | "point";
  delims?: "p" | "b";
}

function isNumberArray(arr: unknown[]): arr is number[] {
  return arr.every((a) => typeof a === "number");
}

export function vec(...entries: number[] | [number[]]): Vector {
  if (isNumberArray(entries)) {
    return new Vector(...entries);
  } else {
    return new Vector(...entries[0]);
  }
}
const x = vec([1, 2, 3]);
console.log(x instanceof Vector);
console.log(x.tex({ delims: "p" }));

export let univUnOps = {
  "+": pos,
  "-": neg,
};

export let univBinOps = {
  "+": plus,
  "-": minus,
  "*": times,
  "/": divide,
  "^": power,
  "=": equals,
};

function pos(x: number | Vector): number | Vector {
  return x;
}

function neg(x: number | Vector): number | Vector {
  if (typeof x === "number") {
    return -x;
  } else {
    return x.times(-1);
  }
}

function plus(x: number | Vector, y: number | Vector): number | Vector {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return x + y;
    } else {
      return y.plus(x);
    }
  } else {
    return x.plus(y);
  }
}

function minus(x: number | Vector, y: number | Vector): number | Vector {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return x - y;
    } else {
      return y.minus(x);
    }
  } else {
    return x.minus(y);
  }
}

function times(x: number | Vector, y: number | Vector): number | Vector {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return x * y;
    } else {
      return y.times(x);
    }
  } else {
    return x.times(y);
  }
}

function divide(x: number | Vector, y: number | Vector): number | Vector {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return x / y;
    } else {
      return y.under(x);
    }
  } else {
    return x.divide(y);
  }
}

function power(x: number | Vector, y: number | Vector): number | Vector {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return Math.pow(x, y);
    } else {
      return y.expBase(x);
    }
  } else {
    return x.power(y);
  }
}

function equals(
  x: number | Vector,
  y: number | Vector,
  eps = 1e-8
): number | Vector {
  if (typeof x === "number") {
    if (typeof y === "number") {
      return Math.abs(x - y) < eps ? 1 : 0;
    } else {
      return y.equals(x);
    }
  } else {
    return x.equals(y);
  }
}
