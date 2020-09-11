import Parser from "./Parse";

let exprs = [
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

for (let expr of exprs) {
  test(expr, () => {
    let P = new Parser(expr);
    expect(P.parse()).toBe(eval(expr.replace(/\^/g, "**")));
  });
}

test("-2^-3^-2", () => {
  let expr = "-2^-3^-2";
  let P = new Parser(expr);
  expect(P.parse()).toBe(-Math.pow(2, -Math.pow(3, -2)));
});

test("x+1", () => {
  let expr = "x+1";
  let P = new Parser(expr, { x: 666 });
  expect(P.parse()).toBe(667);
});

test("-2*x^(11.1e-1*x)", () => {
  let x = 3;
  let expr = "-2*x^(11.1e-1*x)";
  let P = new Parser(expr, { x });
  expect(P.parse()).toBe(eval(expr.replace(/\^/g, "**")));
});

test("x^2.1 + x/(0.1e1*y   +  1) + y**-.2e1", () => {
  let x = 3;
  let y = 4;
  let expr = "x^2.1 + x/(0.1e1*y   +  1) + y**-.2e1";
  let P = new Parser(expr, { x, y });
  expect(P.parse()).toBe(eval(expr.replace(/\^/g, "**")));
});
