# action-gh-push

[![Build Status](https://github.com/justjavac/action-gh-push/workflows/ci/badge.svg)](https://github.com/justjavac/action-gh-push/actions)

> A GitHub Action for pushing to a repo.

## 🤸 Usage

Below is a simple example of `step.if` tag gating

```yaml
name: ci

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Release
        uses: justjavac/action-gh-push@v1
        if: startsWith(github.ref, 'refs/tags/')
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          files: |
            target/release/dvm-x86_64-pc-windows-msvc.zip
            target/release/dvm-x86_64-unknown-linux-gnu.zip
            target/release/dvm-x86_64-apple-darwin.zip
```

> **⚠️ Note:** Notice the `|` in the yaml syntax above ☝️. That let's you effectively declare a multi-line yaml string. You can learn more about multi-line yaml syntax [here](https://yaml-multiline.info)

### 💅 Customizing

#### inputs

The following are optional as `step.with` keys

| Name                      | Type    | Description                                                           |
|---------------------------|---------|-----------------------------------------------------------------------|
| `files`                   | String  | Newline-delimited globs of paths to assets to upload for release      |
| `repository`              | String  | Name of a target repository in `<owner>/<repo>` format. Defaults to `GITHUB_REPOSITORY` env variable |
| `fail_on_unmatched_files` | Boolean | Indicator of whether to fail if any of the `files` globs match nothing|

#### environment variables

The following are *required* as `step.env` keys

| Name           | Description                          |
|----------------|--------------------------------------|
| `GITHUB_TOKEN` | GITHUB_TOKEN as provided by `secrets`|

> **⚠️ Note:** This action was previously implemented as a Docker container, limiting its use to GitHub Actions Linux virtual environments only. With recent releases, we now support cross platform usage. You'll need to remove the `docker://` prefix in these versions

## License

Base on [action-gh-release](https://github.com/softprops/action-gh-release), Copyright Doug Tangren (softprops) 2019 MIT
