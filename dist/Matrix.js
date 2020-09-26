"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Matrix {
    constructor(m, n, entries) {
        if (!Number.isInteger(m) || !Number.isInteger(n)) {
            throw new TypeError("Matrix dimensions must be integers.");
        }
        if (!Number.isFinite(m) || m < 0 || !Number.isFinite(n) || n < 0) {
            throw new RangeError("Matrix dimensions must be nonnegative.");
        }
        if (entries === undefined) {
            this.entries = new Float64Array(m * n);
        }
        else if (entries instanceof Float64Array) {
            this.entries = entries;
        }
        else {
            this.entries = Float64Array.from(entries);
        }
        this.m = m;
        this.n = n;
    }
    static create(m, n, entries) {
        return new Matrix(m, n, entries);
    }
    static row(...xs) {
        return new Matrix(1, xs.length, xs);
    }
    static col(...xs) {
        return new Matrix(xs.length, 1, xs);
    }
    static zero(m, n) {
        return new Matrix(m, n);
    }
    static fromNumber(x) {
        return new Matrix(1, 1, [x]);
    }
    item() {
        if (this.m === 1 && this.n === 1) {
            return this.entries[0];
        }
        else {
            throw Error("Not a 1-by-1 matrix.");
        }
    }
    static lift(f) {
        return function (...Xs) {
            var _a, _b;
            let ms = new Set(Xs.map((X) => X.m));
            ms.delete(1);
            if (ms.size > 1) {
                throw new Error("Incompatible matrix dimensions.");
            }
            let m = (_a = Array.from(ms)[0]) !== null && _a !== void 0 ? _a : 1;
            let ns = new Set(Xs.map((X) => X.n));
            ns.delete(1);
            if (ns.size > 1) {
                throw new Error("Incompatible matrix dimensions.");
            }
            let n = (_b = Array.from(ns)[0]) !== null && _b !== void 0 ? _b : 1;
            let Y = new Float64Array(m * n);
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    let xs = Xs.map((X) => {
                        if (X.m === m) {
                            if (X.n === n) {
                                return X.entries[i * n + j];
                            }
                            else {
                                return X.entries[i];
                            }
                        }
                        else {
                            return X.entries[j];
                        }
                    });
                    Y[i * n + j] = f(...xs);
                }
            }
            return new Matrix(m, n, Y);
        };
    }
    static abs(X) {
        return Matrix.lift(Math.abs)(X);
    }
    abs() {
        return Matrix.abs(this);
    }
    static areClose(X, Y, eps = 1e-8) {
        return Matrix.lift((x, y) => Math.abs(x - y) < eps ? 1 : 0)(X, Y);
    }
    isCloseTo(Y) {
        return Matrix.areClose(this, Y);
    }
    map(f) {
        return new Matrix(this.m, this.n, this.entries.map(f));
    }
    all() {
        return this.entries.every((x) => Math.abs(x) > 1e-8);
    }
    static dot(X, Y) {
        if (X.isVector() && Y.isVector() && X.entries.length === Y.entries.length) {
            return Matrix.fromNumber(X.entries.reduce((s, xi, i) => s + xi * Y.entries[i], 0));
        }
        else {
            throw new Error("Dot product not implemented for matrices.");
        }
    }
    static equals(X, Y) {
        return Matrix.lift((x, y) => Math.abs(x - y) < 1e-8 ? 1 : 0)(X, Y);
    }
    equals(Y) {
        return Matrix.equals(this, Y);
    }
    static plus(...Xs) {
        return Matrix.lift((...xs) => xs.reduce((s, x) => s + x, 0))(...Xs);
    }
    plus(...Xs) {
        return Matrix.plus(this, ...Xs);
    }
    static neg(X) {
        return X.map((x) => -x);
    }
    neg() {
        return Matrix.neg(this);
    }
    static minus(X, Y) {
        return Matrix.plus(X, Matrix.neg(Y));
    }
    minus(Y) {
        return Matrix.minus(this, Y);
    }
    static times(...Xs) {
        return Matrix.lift((...xs) => xs.reduce((s, x) => s * x, 1))(...Xs);
    }
    times(...Xs) {
        return Matrix.times(this, ...Xs);
    }
    static divide(X, Y) {
        return Matrix.times(X, Matrix.pow(Y, Matrix.fromNumber(-1)));
    }
    static pow(X, Y) {
        return Matrix.lift((x, y) => Math.pow(x, y))(X, Y);
    }
    pow(Y) {
        return Matrix.pow(this, Y);
    }
    static transpose(X) {
        let entries = new Float64Array(X.m * X.n);
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
    static vJoin(X, Y) {
        if (X.n !== Y.n) {
            console.log(X, Y);
            throw new Error("Matrices must have the same number of columns.");
        }
        return new Matrix(X.m + Y.m, X.n, [...X.entries, ...Y.entries]);
    }
    vJoin(Y) {
        return Matrix.vJoin(this, Y);
    }
    static hJoin(X, Y) {
        return Matrix.transpose(Matrix.vJoin(Matrix.transpose(X), Matrix.transpose(Y)));
    }
    hJoin(Y) {
        return Matrix.hJoin(this, Y);
    }
    isVector() {
        return this.m === 1 || this.n === 1;
    }
    isNumber() {
        return this.m === 1 && this.n === 1;
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
        console.log(this.toString());
    }
}
exports.default = Matrix;
