# PumpkinSpice graphics engine
## what?
Just a quick start for javascript rendering 3d things. Silly name a few of my friends use whenever we talk about making a game.

## why?
Cause I like to have control of everything instead of using a 3d party library

## should I use this for my game?
Probably not. There are much better libraries to use. Unity or godot etc.

# Running

### VS code setup.
1. Run `bazel build` 
2. Create simlink between bazel node modules and the base of your project 
`ln -s bazel-bin/node_modules node_modules`
3. Install bazel plugin.
