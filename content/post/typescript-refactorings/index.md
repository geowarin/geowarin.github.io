---
title: "Typescript refactorings"
date: 2021-12-19T16:44:00+01:00 
tags: [react, typescript]
summary: Essential React and Typescript refactorings 
description: Essential React and Typescript refactorings 
cover:
    image: images/cover.png
    relative: true
    linkFullImages: true
---

If you are using React and Typescript, there is a lot that your editor can do to help you.

Here are my favorite refactorings, I'm using IntelliJ for the screencast, but most of this
will be available in VSCode as well.

## Rename

If I had to take a single refactoring to a desert island, it would be the "rename" refactoring.

With a typed language, you have no reasons not to use this.

{{< figure src="images/rename.gif" caption="Rename (Shift+F6)" >}}

IntelliJ has smart renames and understand getter/setter paradigms.

Compared to `Ctrl+R` or other manual replace actions, your editor will make sure that you correctly select
only the relevant variable/method as well as being a lot faster.

## Extract component

This refactoring is a real MVP. This enables a whole workflow for me: when I prototype, I lay down all the HTML
until it looks right, then I can extract subcomponents with a simple keybinding.

{{< figure src="images/extract-component.gif" caption="Extract component (no default keybinding)" >}}

I have bound this refactoring to `Ctlr+Alt+Shift+M` because it is similar to the extract method refactoring (`Ctlr+Alt+M`).

You should definitely check out the `Extract method` refactoring, by the way 😀.

## Extract variable

This will allow you add meaningful names to your code in a heartbeat. 

{{< figure src="images/extract-var.gif" caption="Extract variable (Ctrl+Alt+V)" >}}

I should have checked the `const` checkbox here, to have a `const` variable generated,
instead of a `let`. 🤦‍

## Extract type

The extract variable refactoring also works on types!

{{< figure src="images/extract-type.gif" caption="Extract type (Ctrl+Alt+V)" >}}

You can then use `Alt+Enter` to convert the type to an interface if you wish.

## Move

I'm nearly done with my refactoring here, I just need my menu to be in its own file

{{< figure src="images/move.gif" caption="Move (F6)" >}}

And voilà!

## Conclusion

Refactoring can dramatically increase your productivity by providing useful keybindings for sometimes complex code 
transformations.

They also give you full confidence that the resulting code will be 100% valid.

Finally, while I showed you toy examples on a small scale, you can probably imagine how much time will
be saved on a larger scale refactorings!

Thanks to [horsty](https://horsty.fr/) for encouraging me to write this article.
You should check out his blog (in French). He's using the same blog template as I do, he is
a man of taste. 😉
