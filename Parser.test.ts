import parse from "./Parser";

test("1+2=3", () => {
  expect(parse("1+2")).toBe(3);
});

test("2+3*4=14", () => {
  expect(parse("2+3*4")).toBe(14);
});

test("2*3+4=10", () => {
  expect(parse("2*3+4")).toBe(10);
});

test("2+3-4=1", () => {
  expect(parse("2+3-4")).toBe(1);
});

test("2/3*4=24", () => {
  expect(parse("2/3*4")).toBe((2 / 3) * 4);
});

test("1+2*3+4*5+6", () => {
  expect(parse("1+2*3+4*5+6")).toBe(1 + 2 * 3 + 4 * 5 + 6);
});

test("1-2*3+4/5-6", () => {
  expect(parse("1-2*3+4/5-6")).toBe(1 - 2 * 3 + 4 / 5 - 6);
});

test("(2+3)*4=20", () => {
  expect(parse("(2+3)*4")).toBe(20);
});

test("((2+3))*(4)=20", () => {
  expect(parse("((2+3))*(4)")).toBe(20);
});

test("2^3^2", () => {
  expect(parse("2^3^2")).toBe(Math.pow(2, Math.pow(3, 2)));
});

test("-2^-3^-2", () => {
  expect(parse("-2^-3^-2")).toBe(-Math.pow(2, -Math.pow(3, -2)));
});

test("2**2**3*3", () => {
  expect(parse("2**2**3*3")).toBe(2 ** (2 ** 3) * 3);
});
