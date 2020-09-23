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
      return new Vector(...this.map((xi, i) => Math.pow(y[i], xi)));
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

  dot(y: Vector): number {
    if (this.length === y.length) {
      let ans = 0;
      this.forEach((xi, i) => {
        ans += xi * y[i];
      });
      return ans;
    } else {
      throw new Error("Vectors have incompatible sizes.");
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
