export interface ReleaseSource {
  version: string;
  tag: string;
  sha: string;
  ref: string;
  prerelease: boolean;
}

export function releaseSource(
  version: string,
  env: Record<string, string | undefined>,
  head: string,
  tagCommit: string | undefined
): ReleaseSource;
