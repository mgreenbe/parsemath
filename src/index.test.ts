import parse from "./index";

const exprs = [
  "1+2",
  "2.+.3*4e2",
  ".2*3.5+-+.4e-5",
  "2+3.09/-.222-4",
  "2+3.09/-.222-4",
  "2/3*4",
  ".123+0.234*3.56+4.39e2*5.+.6e1",
  "1-2*3+4/5-6",
  "(2.2e0+.3e2)/4.e-1",
  "((2+3))*(4)",
  "2.001^3.2^.2",
  "2e1**2**3*3",
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

test("x^2.1 + x/(0.1e1*y   +  1) + y**-.2e1", () => {
  const x = 3;
  const y = 4;
  const expr = "x^2.1 + x/(0.1e1*y   +  1) + y**-.2e1";
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
  const a1 = 1,
    a2 = 2,
    a3 = 3,
    a4 = 4,
    b1 = 5,
    b2 = 6,
    b3 = 7,
    b4 = 8;
  const lhs = `(a1^2 + a2^2 + a3^2 + a4^2) *
             (b1^2 + b2^2 + b3^2 + b4^2)`;
  const rhs = `(a1 * b1 - a2 * b2 - a3 * b3 - a4 * b4)^2 +
             (a1 * b2 + a2 * b1 + a3 * b4 - a4 * b3)^2 +
             (a1 * b3 - a2 * b4 + a3 * b1 + a4 * b2)^2 +
             (a1 * b4 + a2 * b3 - a3 * b2 + a4 * b1)^2`;
  const expr = `${lhs}=${rhs}`;
  expect(parse(expr, { a1, a2, a3, a4, b1, b2, b3, b4 })).toBe(1);
});
