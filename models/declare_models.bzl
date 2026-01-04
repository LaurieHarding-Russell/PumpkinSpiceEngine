load("@bazel_skylib//rules:copy_file.bzl", "copy_file")

def declare_models(name):
    copy_file(
        name = "copyCube",
        src = "//models:cube.ps",
        out = "cube.ps"
    )
    copy_file(
        name = "copyCubeSkin",
        src = "//models:cube.png",
        out = "cube.png"
    )

    copy_file(
        name = "copyPolice",
        src = "//models:police.ps",
        out = "police.ps"
    )
    copy_file(
        name = "copyPoliceSkin",
        src = "//models:police.png",
        out = "police.png"
    )

    native.filegroup(
        name = name, 
        srcs = [
            ":copyCube",
            ":copyCubeSkin",
            ":copyPolice",
            ":copyPoliceSkin"
        ]
    )
