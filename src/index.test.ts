import { Parser, parse, builtInFuns } from "./index";
import Matrix from "./Matrix";

function numDigits(eps: number, a: number, b: number) {
  let n = -Math.log10(0.5 * eps * (Math.abs(a) + Math.abs(b)));
  return n;
}
test("function application", () => {
  const expr = "sqrt(4)";
  let P = new Parser(expr);
  expect(P.parse().item()).toBe(2);
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
    let a = parse(expr).item();
    let b = eval(expr.replace(/\^/g, "**"));
    expect(a).toBeCloseTo(b, numDigits(1e-12, a, b));
  });
}

test("-2^-3^-2", () => {
  const expr = "-2^-3^-2";
  let a = parse(expr).item();
  let b = -Math.pow(2, -Math.pow(3, -2));
  expect(a).toBeCloseTo(b, numDigits(1e-12, a, b));
});

test("x+1", () => {
  const expr = "x+1";
  expect(parse(expr, { x: 666 }).item()).toBe(667);
});

test("-2*x^(11.1e-1*x)", () => {
  const x = 3;
  const expr = "-2*x^(11.1e-1*x)";
  let a = parse(expr, { x }).item();
  let b = eval(expr.replace(/\^/g, "**"));
  expect(a).toBeCloseTo(b, numDigits(1e-12, a, b));
});

test("x^2.1 + x/(0.1e1*y   +  1) + y^-0.2e1", () => {
  const x = 3;
  const y = 4;
  const expr = "x^2.1 + x/(0.1e1*y   +  1) + y^-0.2e1";
  let a = parse(expr, { x, y }).item();
  let b = eval(expr.replace(/\^/g, "**"));
  expect(a).toBeCloseTo(b, numDigits(1e-12, a, b));
});

test("2+2=5", () => {
  const expr = "2+2=5";
  expect(parse(expr).item()).toBe(0);
});

test("2+2=4", () => {
  const expr = "2+2=4";
  expect(parse(expr).item()).toBe(1);
});

test("x^2 - y^2 = (x - y)*(x + y)", () => {
  const x = 3.14;
  const y = 2.71;
  const expr = "x^2 - y^2 = (x - y)*(x + y)";
  expect(parse(expr, { x, y }).item()).toBe(1);
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
  expect(parse(expr, { a1, a2, a3, a4, b1, b2, b3, b4 }).item()).toBe(1);
});

test("sqrt(a*b) equals sqrt(a)*sqrt(b)", () => {
  const x = 3.14;
  const y = 2.71;
  const expr = "sqrt(x*y) = sqrt(x)*sqrt(y)";
  let funs = { sqrt: builtInFuns.sqrt };
  expect(parse(expr, { x, y }, funs).item()).toBe(1);
});

test("Difference of squares of square roots", () => {
  const x = 3.14;
  const y = 2.71;
  const expr = "(sqrt(abs(-x)) + sqrt(y))*(sqrt(x) - sqrt(y)) = x - abs(-y)";
  let funs = { sqrt: builtInFuns.sqrt, abs: builtInFuns.abs };
  expect(parse(expr, { x, y }, funs).item()).toBe(1);
});

test("exponentials", () => {
  const x = 3.14;
  const y = 2.71;
  const expr1 = "exp(x+y) = exp(x)*exp(y)";
  const expr2 = "exp(x)^-2 = 1/exp(2*x)";
  let funs = { exp: builtInFuns.exp };
  expect(parse(expr1, { x, y }, funs).item()).toBe(1);
  expect(parse(expr2, { x, y }, funs).item()).toBe(1);
});

test("atan2", () => {
  const expr1 = "atan2(exp(0),sqrt(1))";
  expect(parse(expr1, {}, builtInFuns).item()).toBe(Math.PI / 4);
  const x = 3.14;
  const y = 2.71;
  const expr2 = "atan2(y, x) = atan(y/x)";
  expect(parse(expr2, { x, y }, builtInFuns).item()).toBe(1);
  const expr3 = "atan2(y,x)=2*atan( y/(sqrt(x^2+y^2)+x) )";
  expect(parse(expr3, { x, y }, builtInFuns).item()).toBe(1);
});

test("custom function in 3 variables", () => {
  let f = (x: number, y: number, z: number) => x * y + y * z + z * x;
  let expr = "f(x,y,z) = f(z, x, y)";
  expect(
    parse(
      expr,
      { x: 1, y: 2, z: 3 },
      { f: { nargs: 3, apply: Matrix.lift(f) } }
    ).item()
  ).toBe(1);
});

test("vector addition, subtraction, unary +, -", () => {
  let e1 = "u+v=w";
  let e2 = "w-v=u";
  let e3 = "+-u--w=+v";
  let u = Matrix.row(1, 2, 3);
  let v = Matrix.row(4, 5, 6);
  let w = Matrix.row(5, 7, 9);
  let a1 = parse(e1, { u, v, w });
  expect(a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2.all()).toBe(true);
  let a3 = parse(e3, { u, v, w });
  expect(a3.all()).toBe(true);
});

test("vector addition, subtraction: broadcasting", () => {
  let e1 = "u+v=w";
  let e2 = "w-v=u";
  let u = Matrix.col(1, 2, 3);
  let v = 4;
  let w = Matrix.col(5, 6, 7);
  let a1 = parse(e1, { u, v, w });
  expect(a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2.all()).toBe(true);
});

test("vector elementwise *, /", () => {
  let e1 = "u*v=w";
  let e2 = "w/v=u";
  let e3 = "w/u=v";
  let u = Matrix.row(1.1, 2.2, 3.3);
  let v = Matrix.row(4e-1, 5e2, 6);
  let w = u.times(v);
  let a1 = parse(e1, { u, v, w });
  expect(a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2.all()).toBe(true);
  let a3 = parse(e3, { u, v, w });
  expect(a3.all()).toBe(true);
});

test("vector elementwise +, /: broadcasting", () => {
  let e1 = "u*v=w";
  let e2 = "w/v=u";
  let e3 = "w/u=x";
  let u = Matrix.col(1.1, 2.2, 3.3);
  let v = 2e-1;
  let w = Matrix.col(0.22, 0.44, 0.66);
  let x = Matrix.col(v, v, v);
  let a1 = parse(e1, { u, v, w });
  expect(a1.all()).toBe(true);
  let a2 = parse(e2, { u, v, w });
  expect(a2.all()).toBe(true);
  let a3 = parse(e3, { u, v, w, x });
  expect(a3.all()).toBe(true);
});

test("scalar multiplication", () => {
  let i = Matrix.row(1, 0, 0);
  let j = Matrix.row(0, 1, 0);
  let k = Matrix.row(0, 0, 1);
  let u = Matrix.row(1.1, -22e-1, 0.33e1);
  let expr = "1.1*i - 2.2*j + 3.3*k = u";
  let a = parse(expr, { i, j, k, u });
  expect(a.all()).toBe(true);
});

test("apply universal function to vectors", () => {
  let x = Matrix.col(-1, 2, -3, 4);
  let xx = Matrix.col(1, 2, 3, 4);
  let y = Matrix.col(0, 1, 4, 9);
  let yy = Matrix.col(0, 1, 2, 3);
  let e1 = "abs(x)=xx";
  let e2 = "sqrt(y)=yy";
  let a = parse(e1, { x, xx });
  expect(a.all()).toBe(true);
  let b = parse(e2, { y, yy });
  expect(b.all()).toBe(true);
});

test("dot product", () => {
  let x = Matrix.row(-1, 2, -3, 4);
  let y = Matrix.row(1, 2, 3, 4);
  let expr = "dot(x,y)";
  let a = parse(expr, { x, y }).item();
  expect(a).toBe(10);
});

test("vector literal", () => {
  const expr = "[1,2,[3,4,[5,6,7], [8]],[9,  10]]=u";
  let u = Matrix.row(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
  let a = parse(expr, { u });
  expect(a.all()).toBe(true);
});

test("block matrix", () => {
  let x = Matrix.create(3, 3, [1, 2, 5, 3, 4, 5, 6, 6, 6]);
  let P = new Parser("[[[1,2];3,4],[5;5];6,6,6]=x", { x });
  expect(P.parse().all()).toBe(true);
});

test("substitution in matrices", () => {
  let P = new Parser(
    "[sin(pi)  ,cos(pi), pi * 0.5]=[1,0,pi/2]",
    { pi: Math.PI / 2 },
    builtInFuns
  );
  expect(P.parse().all()).toBe(true);
});
