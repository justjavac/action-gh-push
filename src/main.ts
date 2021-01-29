import {
  paths,
  parseConfig,
  isTag,
  unmatchedPatterns,
  getContent
} from "./util";
import { setFailed } from "@actions/core";
import { GitHub } from "@actions/github";
import { env } from "process";

async function run() {
  try {
    const config = parseConfig(env);

    if (!isTag(config.github_ref)) {
      throw new Error(`⚠️ GitHub Releases requires a tag`);
    }

    if (config.input_files) {
      const patterns = unmatchedPatterns(config.input_files);
      patterns.forEach(pattern =>
        console.warn(`🤔 Pattern '${pattern}' does not match any files.`)
      );
      if (patterns.length > 0 && config.input_fail_on_unmatched_files) {
        throw new Error(`⚠️ There were unmatched files`);
      }
    }

    GitHub.plugin([
      require("@octokit/plugin-throttling"),
      require("@octokit/plugin-retry")
    ]);

    const gh = new GitHub(config.github_token, {
      throttle: {
        onRateLimit: (retryAfter, options) => {
          console.warn(
            `Request quota exhausted for request ${options.method} ${options.url}`
          );
          if (options.request.retryCount === 0) {
            // only retries once
            console.log(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onAbuseLimit: (retryAfter, options) => {
          // does not retry, only logs a warning
          console.warn(
            `Abuse detected for request ${options.method} ${options.url}`
          );
        }
      }
    });

    if (config.input_files) {
      const files = paths(config.input_files);
      if (files.length == 0) {
        console.warn(`🤔 ${config.input_files} not include valid file.`);
      }
      files.forEach(async path => {
        const [owner, repo] = config.github_repository.split("/");
        const response = await gh.repos.getContents({ owner, repo, path });
        const tag = config.github_ref.replace("refs/tags/", "");

        if (Array.isArray(response.data)) {
          console.info(`${path} is not a file`);
          return;
        }

        const user = {};

        const message = `🎉 Release ${tag}`;
        gh.repos.createOrUpdateFile({
          owner,
          repo,
          path,
          message,
          content: getContent(path),
          sha: response.data.sha
        });
      });
    }

    console.log(`🎉 Release done`);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
