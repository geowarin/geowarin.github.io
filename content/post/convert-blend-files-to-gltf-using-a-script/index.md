---
title: "Convert blend files to gltf using a script"
date: 2021-11-16T00:44:59+01:00
tags: [blender, GLTF]
summary: You can easily find blend files on the internet, wouldn't it be nice
    to convert them to gltf files with one click?
description: Here is how to convert blend files to gltf in one click!
cover:
    image: images/cover.png
    relative: true
    linkFullImages: true
---
## Scripts

Put this script in your path (e.g.,: `~/bin/blend-export`):

```bash
#!/usr/bin/env bash

DIR=$(dirname "$0")
blender "$1" --background -noaudio -P "$DIR/blender/to_gltf.py"
```

This refers to a python script that you can put in `~/bin/blender/to_gltf.py`:

```python
import bpy
import os

filepath = os.path.basename(bpy.data.filepath)
basepath = os.path.splitext(filepath)
output_file_path = basepath[0] + ".gltf"

bpy.ops.export_scene.gltf(filepath=output_file_path, export_format="GLTF_EMBEDDED")
```

This is straight forward:
- The bash scripts open a blend file in blender, in the background, and directly executes a script
- The script uses the blender api to convert the current scene to gltf

Learn more here:
- [Blender Command Line Arguments](https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html)
- [Blender API](https://docs.blender.org/api/2.93/bpy.ops.export_scene.html?highlight=gltf#bpy.ops.export_scene.gltf)

## Autocomplete

A neat trick: you can use the [fake-bpy-module](https://github.com/nutti/fake-bpy-module) python module
to get auto-completions in your editor.

On arch linux, you can find this [in the AUR](https://aur.archlinux.org/packages/python-fake-bpy-module-2.93)

## Thunar

Finally, I like to have this action in my context menu. I can even convert
a bunch of blend files in on click.

{{< figure src="images/thunar.gif" >}}

To do this, go in the `Edit > Configure custom actions` menu and add a new entry.

{{< figure src="images/thunar-action.png" >}}

Basics
- Name: blend to gltf
- Command: `for file in %F; do /home/geo/bin/blend-export "$file"; done`

Appearance condition
- File Pattern: `*.blend`
- Appears if selections contains: other files

You can find this [in my dotfiles](https://github.com/geowarin/dotfiles-linux/blob/main/.config/Thunar/uca.xml).
