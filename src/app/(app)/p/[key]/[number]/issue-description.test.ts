import { expect, test } from "vitest";
import { toggleTask } from "./issue-description";

test("toggleTask flips the checkbox of the item at the offset", () => {
  const md = "- [ ] one\n- [x] two";
  expect(toggleTask(md, 0)).toBe("- [x] one\n- [x] two");
  expect(toggleTask(md, 10)).toBe("- [ ] one\n- [ ] two");
});
