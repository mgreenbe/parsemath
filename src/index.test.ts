import Parser, { builtInFuns } from "./index";
import { Vector, vec } from "./Vector";

function parse(
  expr: string,
  scope: Record<string, number | Vector> = {},
  funs: Record<string, (...args: number[]) => number> = {}
) {
  let P = new Parser(expr, scope, funs);
  return P.parse();
}

test("function application", () => {
  const expr = "sqrt(4)";
  let P = new Parser(expr);
  expect(P.parse()).toBe(2);
});

const exprs = [
  "1+2",
  "2.+0.3*4e2",
  "0.2*3.5+-+0.4e-5",
  "2+3.09/-0.222-4",
  "2+3.09/-0.222-4",
  "2/3*4",
  "0.123+0.234*3.56+4.39e2*5.+0.6e1",
  "1-2*3+4/5-6",
  "(2.2e0+0.3e2)/4.e-1",
  "((2+3))*(4)",
  "2.001^3.2^0.2",
];

for (const expr of exprs) {
  test(expr, () => {
    expect(parse(expr)).toBe(eval(expr.replace(/\^/g, "**")));
  });
}

test("-2^-3^-2", () => {
  const expr = "-2^-3^-2";
  expect(parse(expr)).toBe(-Math.pow(2, -Math.pow(3, -2)));
});

test("x+1", () => {
  const expr = "x+1";
  expect(parse(expr, { x: 666 })).toBe(667);
});

test("-2*x^(11.1e-1*x)", () => {
  const x = 3;
  const expr = "-2*x^(11.1e-1*x)";
  expect(parse(expr, { x })).toBe(eval(expr.replace(/\^/g, "**")));
});

test("x^2.1 + x/(0.1e1*y   +  1) + y^-0.2e1", () => {
  const x = 3;
  const y = 4;
  const expr = "x^2.1 + x/(0.1e1*y   +  1) + y^-0.2e1";
  expect(parse(expr, { x, y })).toBe(eval(expr.replace(/\^/g, "**")));
});

test("2+2=5", () => {
  const expr = "2+2=5";
  expect(parse(expr)).toBe(0);
});

test("2+2=4", () => {
  const expr = "2+2=4";
  expect(parse(expr)).toBe(1);
});

test("x^2 - y^2 = (x - y)*(x + y)", () => {
  const x = 3.14;
  const y = 2.71;
  const expr = "x^2 - y^2 = (x - y)*(x + y)";
  expect(parse(expr, { x, y })).toBe(1);
});

test("Euler's four square identity", () => {
  const a1 = 1.1,
    a2 = -2.2,
    a3 = 3.3,
    a4 = -4.4,
    b1 = 5.5,
    b2 = -6.6,
    b3 = 7.7,
    b4 = -8.8;
  const lhs = `(a1^2 + a2^2 + a3^2 + a4^2) *
             (b1^2 + b2^2 + b3^2 + b4^2)`;
  const rhs = `(a1 * b1 - a2 * b2 - a3 * b3 - a4 * b4)^2 +
             (a1 * b2 + a2 * b1 + a3 * b4 - a4 * b3)^2 +
             (a1 * b3 - a2 * b4 + a3 * b1 + a4 * b2)^2 +
             (a1 * b4 + a2 * b3 - a3 * b2 + a4 * b1)^2`;
  const expr = `${lhs}=${rhs}`;
  expect(parse(expr, { a1, a2, a3, a4, b1, b2, b3, b4 })).toBe(1);
});

test("sqrt(a*b) equals sqrt(a)*sqrt(b)", () => {
  const x = 3.14;
  const y = 2.71;
  const expr = "sqrt(x*y) = sqrt(x)*sqrt(y)";
  let funs = { sqrt: builtInFuns.sqrt };
  expect(parse(expr, { x, y }, funs)).toBe(1);
});

test("Difference of squares of square roots", () => {
  const x = 3.14;
  const y = 2.71;
  const expr = "(sqrt(abs(-x)) + sqrt(y))*(sqrt(x) - sqrt(y)) = x - abs(-y)";
  let funs = { sqrt: builtInFuns.sqrt, abs: builtInFuns.abs };
  expect(parse(expr, { x, y }, funs)).toBe(1);
});

test("exponentials", () => {
  const x = 3.14;
  const y = 2.71;
  const expr1 = "exp(x+y) = exp(x)*exp(y)";
  const expr2 = "exp(x)^-2 = 1/exp(2*x)";
  let funs = { exp: builtInFuns.exp };
  expect(parse(expr1, { x, y }, funs)).toBe(1);
  expect(parse(expr2, { x, y }, funs)).toBe(1);
});

test("atan2", () => {
  const expr1 = "atan2(exp(0),sqrt(1))";
  expect(parse(expr1, {}, builtInFuns)).toBe(Math.PI / 4);
  const x = 3.14;
  const y = 2.71;
  const expr2 = "atan2(y, x) = atan(y/x)";
  expect(parse(expr2, { x, y }, builtInFuns)).toBe(1);
  const expr3 = "atan2(y,x)=2*atan( y/(sqrt(x^2+y^2)+x) )";
  expect(parse(expr3, { x, y }, builtInFuns)).toBe(1);
});

test("custom function in 3 variables", () => {
  let f = (x: number, y: number, z: number) => x * y + y * z + z * x;
  let expr = "f(x,y,z) = f(z, x, y)";
  expect(parse(expr, { x: 1, y: 2, z: 3 }, { f })).toBe(1);
});

test("vector addition, subtraction, unary +, -", () => {
  let e1 = "u+v=w";
  let e2 = "w-v=u";
  let e3 = "+-u--w=+v";
  let u = vec(1, 2, 3);
  let v = vec(4, 5, 6);
  let w = vec(5, 7, 9);
  let a1 = parse(e1, { u, v, w });
  expect(a1 instanceof Vector && a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2 instanceof Vector && a2.all()).toBe(true);
  let a3 = parse(e3, { u, v, w });
  expect(a3 instanceof Vector && a3.all()).toBe(true);
});

test("vector addition, subtraction: broadcasting", () => {
  let e1 = "u+v=w";
  let e2 = "w-v=u";
  let u = vec(1, 2, 3);
  let v = 4;
  let w = vec(5, 6, 7);
  let a1 = parse(e1, { u, v, w });
  expect(a1 instanceof Vector && a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2 instanceof Vector && a2.all()).toBe(true);
});

test("vector elementwise *, /", () => {
  let e1 = "u*v=w";
  let e2 = "w/v=u";
  let e3 = "w/u=v";
  let u = vec(1.1, 2.2, 3.3);
  let v = vec(4e-1, 5e2, 6);
  let w = u.times(v);
  let a1 = parse(e1, { u, v, w });
  expect(a1 instanceof Vector && a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2 instanceof Vector && a2.all()).toBe(true);
  let a3 = parse(e3, { u, v, w });
  expect(a3 instanceof Vector && a3.all()).toBe(true);
});

test("vector elementwise +, /: broadcasting", () => {
  let e1 = "u*v=w";
  let e2 = "w/v=u";
  let e3 = "w/u=x";
  let u = vec(1.1, 2.2, 3.3);
  let v = 2e-1;
  let w = vec(0.22, 0.44, 0.66);
  let x = vec(v, v, v);
  let a1 = parse(e1, { u, v, w });
  expect(a1 instanceof Vector && a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2 instanceof Vector && a2.all()).toBe(true);
  let a3 = parse(e3, { u, v, w, x });
  expect(a3 instanceof Vector && a3.all()).toBe(true);
});

test("scalar multiplication", () => {
  let i = vec(1, 0, 0);
  let j = vec(0, 1, 0);
  let k = vec(0, 0, 1);
  let u = vec(1.1, -22e-1, 0.33e1);
  let expr = "1.1*i - 2.2*j + 3.3*k = u";
  let a = parse(expr, { i, j, k, u });
  expect(a instanceof Vector && a.all()).toBe(true);
});
