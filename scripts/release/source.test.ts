import { describe, expect, it } from "vitest";

import { releaseSource } from "./source.mjs";

const sha = "a".repeat(40);
const env = {
  GITHUB_REPOSITORY: "calliopeai/calliope-ui",
  GITHUB_EVENT_NAME: "release",
  GITHUB_REF: "refs/tags/v0.1.0",
  GITHUB_SHA: sha,
};

describe("releaseSource", () => {
  it("accepts a published release of the version's tag at the checked-out commit", () => {
    expect(releaseSource("0.1.0", env, sha, sha)).toEqual({
      version: "0.1.0",
      tag: "v0.1.0",
      sha,
      ref: "refs/tags/v0.1.0",
      prerelease: false,
    });
  });

  it("accepts a dispatch on the tag and marks a prerelease", () => {
    expect(
      releaseSource(
        "0.2.0-alpha.1",
        { ...env, GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REF: "refs/tags/v0.2.0-alpha.1" },
        sha,
        sha
      ).prerelease
    ).toBe(true);
  });

  it.each([
    ["a version the tag does not name", "0.1.1", env, sha, sha],
    ["a version that is not semver", "0.1.0;echo pwned", env, sha, sha],
    ["a branch", "0.1.0", { ...env, GITHUB_REF: "refs/heads/main" }, sha, sha],
    ["a tag that moved", "0.1.0", env, sha, "b".repeat(40)],
    ["a checkout that is not the workflow's commit", "0.1.0", env, "b".repeat(40), sha],
    ["another repository", "0.1.0", { ...env, GITHUB_REPOSITORY: "other/repo" }, sha, sha],
    ["a push", "0.1.0", { ...env, GITHUB_EVENT_NAME: "push" }, sha, sha],
  ])("refuses %s", (_name, version, input, head, tagCommit) => {
    expect(() => releaseSource(version, input, head, tagCommit)).toThrow();
  });
});
