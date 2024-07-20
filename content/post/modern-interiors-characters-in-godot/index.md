---
title: "Setup Modern interiors characters in godot"
date: 2024-04-17T17:39:24+02:00
tags: [ godot, 2D ]
summary: Let's make a little script to generate all the AnimatedSprite2Ds from LimeZu's widely successful asset pack in Godot.
cover:
  image: images/cover.png
  relative: true
  linkFullImages: true
---

If you don't know about [Modern Interiors](https://limezu.itch.io/moderninteriors),
you are missing out on a very successful high quality pixel art bundle (and it's very cheap too!).

It comes with hundreds of sprite sheets to make characters composed of:

- A body
- Eyes
- Hair
- An outfit
- An accessory

Each sprite sheet is laid out exactly the same way, each sprite has the same dimensions and each sprite frame represents
the same part of the same animation.

{{< figure src="./images/sprite_sheet.png" caption="One of the sprite sheets" >}}

This means that if you set up five `AnimatedSprite2D`s on top of each other, in the right order, you will get the
character you want.

{{< figure src="./images/scene.png" caption="The character scene is composed of 5 AnimatedSprite2D" >}}

The problem is that we will have to manually set up each animation, in 4 directions for hundreds of sprites!

{{< figure src="./images/animations.png" caption="The animations in the SpriteFrames window" >}}

This is tedious but what if we automated the process?
If you try to set up an `AnimatedSprite2D`, you will see that it uses `SpriteFrames` as a source for its animation,
which is a Godot resource.

So if we had a `SpriteFrames` for each sprite sheet, all we would have to do is select the one we want for each part of
our character.

{{< figure src="./images/select_body.png" caption="We can select a sprite frame for our body" >}}

First let's import all the PNGs in our Godot project.

I have created a directory named `assets/characters` and this directory contains five
subdirectories: `Accessories`, `Bodies`, `Eyes`, `Hairstyles` and `Outfits`.
Each directory then contains the sprite sheets. I have chosen 32x32 for my sprite dimensions (16x16 and 48x48 are also
available, if you'd like another size more, you'll have minor adjustments to make)

{{< figure src="./images/character_files.png" caption="File system view" >}}

In my case, the 32x32 sprite sheet is composed of 57 columns and 20 lines of 32x64 sprites.
The sprite at index 0 is always the character looking right, the sprite at index 1 is looking up and the sprites from
index 57 to 62 compose the walking right animation, for example.

So all we have to do is:

- create a dictionary containing all the animations and their respective indexes.
- iterate on all the sprites sheets on disk
- for each sprite sheet, create a `SpriteFrames` based on its image and add each animation with its corresponding image
  atlas

{{< figure src="./images/sprite_sheet.png" caption="The sprite sheet again ;)" >}}

Let's create an [EditorScript](https://docs.godotengine.org/en/stable/classes/class_editorscript.html).

The code is pretty straight forward:

```gdscript
@tool
extends EditorScript

# get the possible extensions of the ImageTexture resource (png, svg, etc)
var exts := ResourceSaver.get_recognized_extensions(ImageTexture.new())


func _run() -> void:
    generate_for_dir("res://assets/characters/Bodies/")
    generate_for_dir("res://assets/characters/Eyes/")
    generate_for_dir("res://assets/characters/Hairstyles/")
    generate_for_dir("res://assets/characters/Outfits/")
    generate_for_dir("res://assets/characters/Accessories/")


# for each file in the directory, if it's indeed a Texture2D, generate sprite frames
func generate_for_dir(path: String) -> void:
    var dir := DirAccess.open(path)
    if dir:
        dir.list_dir_begin()
        var file_name = dir.get_next()
        while file_name != "":
            if !dir.current_is_dir() && exts.has(file_name.get_extension()):
                var res := ResourceLoader.load(path.path_join(file_name))
                if res is Texture2D:
                    generate_sprite_frames(res)

            file_name = dir.get_next()
    else:
        print("An error occurred when trying to access %s" % path)

const anims := {
                   "static_right": [0],
                   "static_up": [1],
                   "static_left": [2],
                   "static_down": [3],

                   "idle_right": [57, 58, 59, 60, 61, 62],
                   "idle_up": [63, 64, 65, 66, 67, 68],
                   "idle_left": [69, 70, 71, 72, 73, 74],
                   "idle_down": [75, 76, 77, 78, 79, 80],

                   "walk_right": [114, 115, 116, 117, 118, 119],
                   "walk_up": [120, 121, 122, 123, 124, 125],
                   "walk_left": [126, 127, 128, 129, 130, 131],
                   "walk_down": [132, 133, 134, 135, 136, 137],
               }
const horiz := 57
const size  := Vector2(32, 64)


func generate_sprite_frames(texture: Texture2D) -> void:
    print("texture %s" % texture.resource_path)
    #var horiz := floori(texture.get_size().x / size.x)

    var resource_path := texture.resource_path

    var frames := SpriteFrames.new()
    frames.remove_animation("default")

    for anim_name in anims:
        frames.add_animation(anim_name)
        var frame_indexes: Array = anims[anim_name]

        for i in range(frame_indexes.size()):
            var index: int =  frame_indexes[i]
            var atlas      := AtlasTexture.new()
            atlas.atlas = texture
            var pos        := Vector2(size.x * (index % horiz), size.y * (index / horiz))
            atlas.region = Rect2(pos, size)
            frames.add_frame(anim_name, atlas, 1.0, i)

    var file_name := resource_path.get_file().trim_suffix("." + resource_path.get_extension())
    ResourceSaver.save(frames, resource_path.get_base_dir().path_join(file_name + ".tres"))
```

The part with AtlasTexture is not very well documented, I had to look up
the [engine source code](https://github.com/godotengine/godot/blob/6dd4a687972fbb53e53aba008cc4fbea2c87d6af/editor/plugins/sprite_frames_editor_plugin.cpp#L297-L300)
to understand it. And I encourage you to do the same!

Generally, the C++ source code is very close to its equivalent in GDScript!

Execute the script (`File > Run` or `Ctrl+Shift+X`), it might hang the editor for a short while (it has a lot of work to
do!).

Then, you will have a `SpriteFrames` resources generated for each sprite sheet.

{{< figure src="./images/result.png" caption="We have generated a SpriteFrames resource for each PNG" >}}

Now drop it in a `AnimatedSprite2D` and you are ready to roll :)

I have made little test scene in which a character is randomly generated every time you press `R`.

```gdscript
extends CharacterBody2D

@export var bodies: Array[SpriteFrames] = []
@export var eyes: Array[SpriteFrames] = []
@export var outfits: Array[SpriteFrames] = []
@export var hairs: Array[SpriteFrames] = []
@export var accessories: Array[SpriteFrames] = []


func _ready() -> void:
    play_all()


func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventKey && event.keycode == KEY_R && !event.is_pressed():
        randomize_char()


func randomize_char() -> void:
    $Body.sprite_frames = bodies.pick_random()
    $Eyes.sprite_frames = eyes.pick_random()
    $Hair.sprite_frames = hairs.pick_random()
    $Outfit.sprite_frames = outfits.pick_random()
    $Accessory.sprite_frames = accessories.pick_random()
    play_all()


func play_all() -> void:
    $Body.stop()
    $Eyes.stop()
    $Hair.stop()
    $Outfit.stop()
    $Accessory.stop()
    $Body.play("idle_down")
    $Eyes.play("idle_down")
    $Hair.play("idle_down")
    $Outfit.play("idle_down")
    $Accessory.play("idle_down")
```

To set it up, you will have to drag and drop your different sprites frames you have generated to set up the `@export`
variables.

{{< figure src="./images/test_scene.png" caption="Drag and drop all the sprite frames in this scene to test our character generator" >}}

Here is the result:

{{< video autoplay="true" loop="true" src="./images/tada.webm" >}}
