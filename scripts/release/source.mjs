/**
 * The publication identity, checked without modifying a version, branch or
 * tag: publish.yml publishes only the commit an existing `v<package.json
 * version>` tag points at, from a published release or a dispatch on that
 * tag. Run from the repository root; writes version, tag, sha, ref and
 * prerelease to $GITHUB_OUTPUT.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function releaseSource(version, env, head, tagCommit) {
  if (
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z]+([.-][0-9A-Za-z]+)*)?$/.test(
      version
    ) ||
    version.length > 127
  )
    throw new Error("Invalid release version");
  if (
    env.GITHUB_REPOSITORY !== "calliopeai/calliope-ui" ||
    !/^[a-f0-9]{40}$/.test(head) ||
    env.GITHUB_SHA !== head
  )
    throw new Error("Checkout does not match the workflow source identity");
  if (
    !["release", "workflow_dispatch"].includes(env.GITHUB_EVENT_NAME) ||
    env.GITHUB_REF !== `refs/tags/v${version}` ||
    tagCommit !== head
  )
    throw new Error(
      `Publication requires the existing tag v${version} on the checked-out commit, from a published release or a dispatch on that tag`
    );
  return {
    version,
    tag: `v${version}`,
    sha: head,
    ref: env.GITHUB_REF,
    prerelease: version.includes("-"),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length > 2) throw new Error("Invalid release source arguments");
  const version = JSON.parse(readFileSync("package.json", "utf8")).version;
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
  const head = git("rev-parse", "HEAD");
  const tagCommit = git("rev-parse", "--verify", `refs/tags/v${version}^{commit}`);
  const result = releaseSource(version, process.env, head, tagCommit);
  if (process.env.GITHUB_OUTPUT)
    for (const [key, value] of Object.entries(result))
      appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  console.log(JSON.stringify(result));
}
