# this is an example of loading data
 
##Adding a model.

1. Copy .ps into folder with its texture file.
2. Add name of file to the exports_files rule
3. Add copy rule to declare_models macro in declare_models.bzl 
4. Export the object and png file in the BUILD file.
5. Add logic to ModelResources.ts and a load function in the example (Outside of the library)

