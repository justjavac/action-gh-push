import { paths, parseConfig, unmatchedPatterns, getContent } from "./util";
import { getSha } from "./github";
import { setFailed } from "@actions/core";
import { GitHub } from "@actions/github";
import { env } from "process";
import { basename } from "path";

async function run() {
  try {
    const config = parseConfig(env);

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
      files.forEach(async fullpath => {
        try {
          const [owner, repo] = config.github_repository.split("/");
          const hash = config.github_ref.replace("refs/heads/", "");
          const path = basename(fullpath);

          const message = `🎉 Release ${hash}`;
          await gh.repos.createOrUpdateFile({
            owner,
            repo,
            path,
            message,
            content: getContent(fullpath),
            sha: await getSha(gh, config, path)
          });
        } catch (error) {
          console.log(`⚠️ GitHub push failed with status: ${error.status}`);
          console.log(error);
        }
      });
    }

    console.log(`🎉 Push done`);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
