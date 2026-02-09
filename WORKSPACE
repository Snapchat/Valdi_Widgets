workspace(name = "valdi_widgets")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# Valdi release beta-0.0.2 (https://github.com/Snapchat/Valdi/releases)
http_archive(
    name = "valdi",
    strip_prefix = "Valdi-beta-0.0.2",
    url = "https://github.com/Snapchat/Valdi/archive/refs/tags/beta-0.0.2.tar.gz",
)

# For local development:
# local_repository(name = "valdi", path = "/path/to/Valdi")

load("@valdi//bzl:workspace_prepare.bzl", "valdi_prepare_workspace")

valdi_prepare_workspace()

load("@valdi//bzl:workspace_preinit.bzl", "valdi_preinitialize_workspace")

valdi_preinitialize_workspace()

load("@aspect_bazel_lib//lib:repositories.bzl", "aspect_bazel_lib_dependencies", "aspect_bazel_lib_register_toolchains", "register_yq_toolchains")

register_yq_toolchains()

# Required bazel-lib dependencies

aspect_bazel_lib_dependencies()

# Required rules_shell dependencies
load("@rules_shell//shell:repositories.bzl", "rules_shell_dependencies", "rules_shell_toolchains")

rules_shell_dependencies()

rules_shell_toolchains()

# Register bazel-lib toolchains

aspect_bazel_lib_register_toolchains()

# Create the host platform repository transitively required by bazel-lib

load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")
load("@platforms//host:extension.bzl", "host_platform_repo")

maybe(
    host_platform_repo,
    name = "host_platform",
)

load("@valdi//bzl:workspace_init.bzl", "valdi_initialize_workspace")

valdi_initialize_workspace()

load("@valdi_npm//:repositories.bzl", "npm_repositories")

npm_repositories()

load("@valdi//bzl:workspace_postinit.bzl", "valdi_post_initialize_workspace")

valdi_post_initialize_workspace()