workspace(name = "valdi_widgets")

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# # Replace to http_archive once the git repo is public.
git_repository(
    name = "valdi",
    remote = "git@github.com:Snapchat/Valdi.git",
    branch = "main",
)

#local_repository(
#    name = "valdi",
#    path = "../Valdi",
#)


load("@valdi//bzl:workspace_prepare.bzl", "valdi_prepare_workspace")

valdi_prepare_workspace()

load("@valdi//bzl:workspace_preinit.bzl", "valdi_preinitialize_workspace")

valdi_preinitialize_workspace()

load("@valdi//bzl:workspace_init.bzl", "valdi_initialize_workspace")

valdi_initialize_workspace()
