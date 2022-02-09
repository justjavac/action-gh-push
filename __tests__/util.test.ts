import {
  paths,
  parseConfig,
  parseInputFiles,
  unmatchedPatterns
} from "../src/util";
import * as assert from "assert";

describe("util", () => {
  describe("parseInputFiles", () => {
    it("parses empty strings", () => {
      assert.deepStrictEqual(parseInputFiles(""), []);
    });
    it("parses comma-delimited strings", () => {
      assert.deepStrictEqual(parseInputFiles("foo,bar"), ["foo,bar"]);
    });
    it("parses newline and comma-delimited (and then some)", () => {
      assert.deepStrictEqual(
        parseInputFiles("foo,bar\nbaz,boom,\n\ndoom,loom "),
        ["foo,bar", "baz,boom,", "doom,loom"]
      );
    });
  });
  describe("parseConfig", () => {
    it("parses basic config", () => {
      assert.deepStrictEqual(parseConfig({}), {
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_files: [],
        input_fail_on_unmatched_files: false
      });
    });
  });

  describe("paths", () => {
    it("resolves files given a set of paths", async () => {
      assert.deepStrictEqual(
        paths(["tests/data/**/*", "tests/data/does/not/exist/*"]),
        ["tests/data/foo/bar.txt"]
      );
    });
  });

  describe("unmatchedPatterns", () => {
    it("returns the patterns that don't match any files", async () => {
      assert.deepStrictEqual(
        unmatchedPatterns(["tests/data/**/*", "tests/data/does/not/exist/*"]),
        ["tests/data/does/not/exist/*"]
      );
    });
  });
});
