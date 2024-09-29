load("@npm//:defs.bzl", "npm_link_all_packages")
load("@aspect_rules_js//npm:defs.bzl", "npm_link_package")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config")

# TypeScript and other node programs beneath bazel-bin/examples are able to resolve its location.
npm_link_package(
    name = "node_modules/@pumkinspicegames/graphics_engine",
    src = "//graphics-engine:pumpkinSpiceEngine",
    # root_package = "",
    visibility = ["//:__subpackages__"],
)


npm_link_all_packages(name = "node_modules")

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    visibility = ["//visibility:public"],
)
