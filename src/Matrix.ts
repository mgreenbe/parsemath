export default class Matrix {
  entries: Float32Array;
  m: number;
  n: number;
  private constructor(m: number, n: number, entries?: number[] | Float32Array) {
    if (!Number.isInteger(m) || !Number.isInteger(n)) {
      throw new TypeError("Matrix dimensions must be integers.");
    }
    if (!Number.isFinite(m) || m < 0 || !Number.isFinite(n) || n < 0) {
      throw new RangeError("Matrix dimensions must be nonnegative.");
    }

    if (entries === undefined) {
      this.entries = new Float32Array(m * n);
    } else if (entries instanceof Float32Array) {
      this.entries = entries;
    } else {
      this.entries = Float32Array.from(entries);
    }
    this.m = m;
    this.n = n;
  }

  static create(m: number, n: number, entries?: number[] | Float32Array) {
    return new Matrix(m, n, entries);
  }

  static zero(m: number, n: number) {
    return new Matrix(m, n);
  }

  static fromNumber(x: number) {
    return new Matrix(1, 1, [x]);
  }

  static lift(f: (...xs: number[]) => number): (...Xs: Matrix[]) => Matrix {
    return function (...Xs: Matrix[]) {
      let ms = new Set(Xs.map((X) => X.m));
      ms.delete(1);
      if (ms.size > 1) {
        throw new Error("Incompatible matrix dimensions.");
      }
      let m = Array.from(ms)[0] ?? 1;

      let ns = new Set(Xs.map((X) => X.m));
      ns.delete(1);
      if (ns.size > 1) {
        throw new Error("Incompatible matrix dimensions.");
      }
      let n = Array.from(ns)[0] ?? 1;

      let Y = new Float32Array(m * n);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          let xs = Xs.map((X) => {
            if (X.m === m) {
              if (X.n === n) {
                return X.entries[i * n + j];
              } else {
                return X.entries[i];
              }
            } else {
              return X.entries[j];
            }
          });
          Y[i * n + j] = f(...xs);
        }
      }
      return new Matrix(m, n, Y);
    };
  }

  map(f: (x: number) => number) {
    return new Matrix(this.m, this.n, this.entries.map(f));
  }

  static plus(...Xs: Matrix[]) {
    return Matrix.lift((...xs: number[]) => xs.reduce((s, x) => s + x, 0))(
      ...Xs
    );
  }

  plus(...Xs: Matrix[]) {
    return Matrix.plus(this, ...Xs);
  }

  static neg(X: Matrix) {
    return X.map((x) => -x);
  }

  neg() {
    return Matrix.neg(this);
  }

  static minus(X: Matrix, Y: Matrix) {
    return Matrix.plus(X, Matrix.neg(Y));
  }

  minus(Y: Matrix) {
    return Matrix.minus(this, Y);
  }

  static times(...Xs: Matrix[]) {
    return Matrix.lift((...xs: number[]) => xs.reduce((s, x) => s * x, 1))(
      ...Xs
    );
  }

  times(...Xs: Matrix[]) {
    return Matrix.times(this, ...Xs);
  }

  static divide(X: Matrix, Y: Matrix) {
    return Matrix.times(X, Matrix.pow(Y, Matrix.fromNumber(-1)));
  }

  static pow(X: Matrix, Y: Matrix) {
    return Matrix.lift((x: number, y: number) => Math.pow(x, y))(X, Y);
  }

  pow(Y: Matrix) {
    return Matrix.pow(this, Y);
  }

  static transpose(X: Matrix) {
    let entries = new Float32Array(X.m * X.n);
    for (let j = 0; j < X.n; j++) {
      for (let i = 0; i < X.m; i++) {
        entries[j * X.m + i] = X.entries[i * X.n + j];
      }
    }
    return new Matrix(X.n, X.m, entries);
  }

  transpose() {
    return Matrix.transpose(this);
  }

  static vJoin(X: Matrix, Y: Matrix) {
    if (X.n !== Y.n) {
      throw new Error("Matrices must have the same number of columns.");
    }
    return new Matrix(X.m + Y.m, X.n, [...X.entries, ...Y.entries]);
  }

  vJoin(Y: Matrix) {
    return Matrix.vJoin(this, Y);
  }

  static hJoin(X: Matrix, Y: Matrix) {
    return Matrix.transpose(
      Matrix.vJoin(Matrix.transpose(X), Matrix.transpose(Y))
    );
  }

  hJoin(Y: Matrix) {
    return Matrix.hJoin(this, Y);
  }

  toString() {
    let rows = [];
    for (let i = 0; i < this.m; i++) {
      let row = "";
      for (let j = 0; j < this.n; j++) {
        row += this.entries[i * this.n + j].toString().padStart(5, " ");
      }
      rows.push(row);
    }
    return rows.join("\n");
  }

  log() {
    console.log(this.toString(), "\n");
  }
}

let a = Matrix.create(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
let b = Matrix.create(2, 3, [1, 2, 3, 4, 5, 6]);
a.transpose().hJoin(b.transpose()).transpose().log();
