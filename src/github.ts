import { GitHub } from "@actions/github";
import { Config } from "./util";

export const getSha = async (
  gh: GitHub,
  config: Config,
  path: string
): Promise<string | undefined> => {
  try {
    const [owner, repo] = config.github_repository.split("/");
    const response = await gh.repos.getContents({ owner, repo, path });

    if (Array.isArray(response.data)) {
      throw new Error(`${path} is not a file`);
    }

    return response.data.sha;
  } catch (error) {
    if (error.status === 404) {
      return undefined;
    }
    throw error;
  }
};
