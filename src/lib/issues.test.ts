import { describe, expect, it } from "vitest";
import { createIssueInput, createProjectInput, parseRef, updateIssueInput, updateProjectInput } from "./issues";

describe("parseRef", () => {
  it("parses a ref, ignoring case and spaces", () => {
    expect(parseRef("WEB-42")).toEqual({ key: "WEB", number: 42 });
    expect(parseRef(" web-7 ")).toEqual({ key: "WEB", number: 7 });
  });

  it("returns null for things that aren't refs", () => {
    for (const bad of ["WEB", "WEB-", "WEB-0", "WEB-abc", "42", "-42", "WEB-4-2", ""]) {
      expect(parseRef(bad)).toBeNull();
    }
  });
});

describe("createProjectInput", () => {
  it("uppercases and trims the key", () => {
    expect(createProjectInput.parse({ key: " web ", name: "Website" }).key).toBe("WEB");
  });

  it("rejects bad keys and empty names", () => {
    expect(createProjectInput.safeParse({ key: "W", name: "x" }).success).toBe(false);
    expect(createProjectInput.safeParse({ key: "1WEB", name: "x" }).success).toBe(false);
    expect(createProjectInput.safeParse({ key: "WEB", name: "  " }).success).toBe(false);
  });
});

describe("createIssueInput", () => {
  it("needs only a project key and a title", () => {
    expect(createIssueInput.parse({ projectKey: "web", title: " Fix it " })).toEqual({
      projectKey: "WEB",
      title: "Fix it",
    });
  });

  it("rejects an empty title, and unknown status", () => {
    expect(createIssueInput.safeParse({ projectKey: "WEB", title: "" }).success).toBe(false);
    expect(createIssueInput.safeParse({ projectKey: "WEB", title: "x", status: "nope" }).success).toBe(false);
  });
});

describe("updateIssueInput", () => {
  it("keeps only the fields passed", () => {
    expect(updateIssueInput.parse({ status: "done" })).toEqual({ status: "done" });
  });
});

describe("updateProjectInput", () => {
  it("trims the name, rejects an empty one, and ignores the key", () => {
    expect(updateProjectInput.parse({ name: " Site ", key: "NEW" })).toEqual({ name: "Site" });
    expect(updateProjectInput.safeParse({ name: "  " }).success).toBe(false);
  });

  it("accepts palette colours only", () => {
    expect(updateProjectInput.parse({ name: "Site", color: "blue" }).color).toBe("blue");
    expect(updateProjectInput.safeParse({ name: "Site", color: "#ff0000" }).success).toBe(false);
  });
});
