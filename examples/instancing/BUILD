load("@aspect_rules_rollup//rollup:defs.bzl", "rollup")
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("//models:declare_models.bzl", "declare_models")

js_binary(
    name = "test",
    entry_point = "server.js",
    data = [
        "//:node_modules/express",
        ":bundle",
        ":html",
        ":styles",
        ":models",
    ]
)

declare_models(
    name = "models"
)

ts_project(
    name = "app",
    srcs = glob(["*.ts"]),
    declaration = True,
    transpiler = "tsc",
    deps = [
        "//:node_modules/@pumkinspicegames/graphics_engine",
        "//:node_modules/gl-matrix",
        "//:node_modules/tslib"
    ]
)

rollup(
    name = "bundle",
    config_file = ":rollup.config.js",
    entry_point = ":index.js",
    node_modules = "//:node_modules",
    sourcemap = "false",
    deps = [
        ":app",
        "//:node_modules/@rollup/plugin-node-resolve"
    ],
)

filegroup(
    name = "styles",
    srcs = [
        "base.css"
    ]
)

filegroup(
    name = "html",
    srcs = [
        "index.html"
    ]
)