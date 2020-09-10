import parse from "./Parser";

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
    expect(parse(expr)).toBe(eval(expr.replace(/\^/g, "**")));
  });
}

test("-2^-3^-2", () => {
  expect(parse("-2^-3^-2")).toBe(-Math.pow(2, -Math.pow(3, -2)));
});
