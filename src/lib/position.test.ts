import { describe, expect, it } from "vitest";
import { positionBetween } from "./position";

describe("positionBetween", () => {
  it("lands halfway between two neighbours", () => {
    expect(positionBetween(1, 2)).toBe(1.5);
  });

  it("goes after the last card or before the first", () => {
    expect(positionBetween(5, undefined)).toBe(6);
    expect(positionBetween(undefined, 5)).toBe(4);
  });

  it("starts at 0 in an empty column", () => {
    expect(positionBetween()).toBe(0);
  });
});
