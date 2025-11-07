# Valdi Widgets

Provides helpful UI widgets, styles, and patterns for building apps with [Valdi](https://github.com/Snapchat/Valdi).

## Setup `Valdi_Widgets`

To setup your Valdi project to use the `Valdi_Widgets` library, update your `WORKSPACE` file with the following:

```starlark
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "valdi_widgets",
    branch = "main",
    remote = "git@github.com:Snapchat/Valdi_Widgets.git",
)
```
