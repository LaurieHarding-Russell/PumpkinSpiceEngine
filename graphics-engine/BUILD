load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")

ts_project(
    name = "graphics-engine",
    srcs = glob(["**/*.ts"], exclude=["**/*.spec.ts"]),
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        "//:node_modules/gl-matrix",
        "//:node_modules/@types/webgl2",
        "//:node_modules/tslib"
    ],
    visibility = ["//visibility:public"],
)

npm_package(
    name = "pumpkinSpiceEngine",
    srcs = [
        ":graphics-engine",
        "package.json"
    ],
    include_runfiles = False,
    package = "@pumkinspicegames/pumpkinSpiceEngine",
    visibility = ["//visibility:public"],
)

# Tests
load("@aspect_rules_jest//jest:defs.bzl", "jest_test")

jest_test(
    name = "test",
    config = "jest.config.mjs",
    data = [
        ":utilTest",
        "babel.config.json",
    ],
    node_options = [
        "--experimental-vm-modules",
    ],
    node_modules = "//:node_modules",
)


ts_project(
    name = "utilTest",
    srcs = glob(["**/*.spec.ts"]),
    declaration = True,
    transpiler = "tsc",
    tsconfig = "//:tsconfig",
    deps = [
        ":graphics-engine",
        "//:node_modules/@types/jest",
        "//:node_modules/jest-environment-jsdom",
        "//:node_modules/ts-jest"
    ],
    visibility = ["//visibility:public"],
)
