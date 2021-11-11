---
title: "Thumbnails in Linux"
date: 2021-09-11T18:42:59+02:00
tags:
 - linux
 - 3D
description:
summary: 
 Linux has a nice system to display thumbnails. 
 Let's try it to display GLTF files in thunar.
---
 
{{< figure src="images/cover.png" title="glb files thumbnails in thunar" >}}

## Mime mapping

In my distro, there were no mimetypes declared for gltf/glb files. 

So I added the following mapping in `~/.local/share/mime/packages/gltf.xml`

```
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns='http://www.freedesktop.org/standards/shared-mime-info'>
  <mime-type type="model/gltf+json">
    <comment>GLTF model</comment>
    <icon name="model-stl"/>
    <glob pattern="*.gltf"/>
  </mime-type>
    <mime-type type="model/gltf.binary">
    <comment>GLTF binary model</comment>
    <icon name="model-stl"/>
    <glob pattern="*.glb"/>
  </mime-type>
</mime-info>
```

Let's update the mime database with `update-mime-database ~/.local/share/mime`.

## Gltf viewer

I found a nice program, written in rust, to preview gltf files:
[gltf-viewer](https://github.com/bwasty/gltf-viewer)

Let's add a desktop entry for this in
`/home/geo/.local/share/applications/gltf_viewer.desktop`.

```
[Desktop Entry]
Name=GLTF Viewer
GenericName=3D Model viewer
Comment=3D Model viewer
Exec=/home/geo/bin/gltf-viewer
Terminal=false
Type=Application
Icon=acreloaded
Categories=Graphics;3DGraphics;Viewer;
MimeType=model/gltf+json;model/gltf.binary;
NoDisplay=false
```

This will associate `gltf-viewer` with our glb/gltf files. 
The program should launch when clicking gltf files in the file manager.

You might have to `update-desktop-database ~/.local/share/applications`
for this to take effect.

## Thumbnails

`gltf-viewer` also has a feature to output a png image given a 3D model
as input.

Let's write a little script to use that. I'll put this in my path in `~/bin/gltf-thumbnailer`.

```
#!/bin/bash
input=$1
output=$2
size=$3

/home/geo/bin/gltf-viewer -s "$output" -w "$size" -h "$size" "$input"
```

Now the final piece of the puzzle: creating a thumbnail entry in `/usr/share/thumbnailers/gltf.thumbnailer`.

```
[Thumbnailer Entry]
TryExec=/home/geo/bin/gltf-thumbnailer
Exec=/home/geo/bin/gltf-thumbnailer %i %o %s
MimeType=model/gltf+json;model/gltf.binary;
```

Here is an example of the parameters you can pass to your program:

```text
# %u %o %i %s
# %u: url (ex: file:///home/geo/Models/gltf/bookB.gltf.glb)
# %o: output thumbnail (ex: /tmp/tumbler-X0YBM90.png) 
# %i: input file (ex: /home/geo/Models/gltf/bookB.gltf.glb)
# %s: size (ex: 128)
```

If you mess up, you can always remove the thumbnail cache:
`rm -rf .cache/thumbnails/`

