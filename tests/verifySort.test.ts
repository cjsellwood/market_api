import verifySort from "../utils/verifySort";

describe("Format sort for sql query", () => {
  test("Takes in on and sort by on", () => {
    expect(verifySort("on")).toBe("on");
  });

  test("Takes in lh and sort by lh", () => {
    expect(verifySort("lh")).toBe("lh");
  });

  test("Takes in hl and sort by hl", () => {
    expect(verifySort("hl")).toBe("hl");
  });

  test("Takes in random text and return no", () => {
    expect(verifySort("asdlfkjasd")).toBe("no");
  });
});
