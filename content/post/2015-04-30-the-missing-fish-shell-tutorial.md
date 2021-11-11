---
categories:
- shell
date: 2015-04-30T00:00:00Z
Summary: Fish is an awesome shell but requires a bit of practice. Here are a few tips
  I wish people gave me when I started using it.
tags:
- tips
- shell
- tuning
- featured
title: The missing fish shell tutorial
aliases:
    - /completable-futures-with-spring-async.html
---

I must admit it after years of trying to avoid writing script shells: I'm not a big fan of bash.
Sure you can do amazing things when you become a script guru but for someone who spends his life trying to write
readable code, it feels a bit unnatural.

So it was with great pleasure and a bit of excitation that I began playing with the new kid in the shell block:
[fish](http://fishshell.com/).

After a few weeks of practice, I can tell you that I love it.
Here are a few tips to get you started using fish.

## Installation


The following command will install fish:

```
brew install fish
```

To add it as an available shell, you should `sudo vi /etc/shells` and add the following line `/usr/local/bin/fish`.
Now to use it as default, type:

```
chsh -s /usr/local/bin/fish
```

## Configure you shell

First thing you can do is to configure fish. Type:

```
fish_config
```

You will be brought to a web page where you can configure your prompt and various options of fish.
Personally, I use the `Classic + Git` prompt which is still minimalist but will display useful information when you
are inside a git repository.

You can see right away one of the big pros of fish: it is very fast, easy to customize and has very good defaults.

## Install oh my fish

There is one small problem with fish: *it is not compatible with POSIX*.
This means that you cannot directly use bash commands or scripts directly in fish.

Of course, you can invoke bash inside of fish: `bash my-command`.
But there is a simpler solution for a handful of very handy scripts called [oh-my-fish](https://github.com/bpinto/oh-my-fish).

Oh-my-fish allows you to use plugins (some kind of functions with shell loading hooks) to easily
customize your shell.

Follow the very simple [installation instructions](htps://github.com/bpinto/oh-my-fish#installation).
This will create a new fish configuration.
The main configuration file in fish is located in `~/.config/fish/config.fish` and it will be replaced by oh-my-fish (it
will be backed up don't worry).

In a nutshell, installing oh-my-fish will add the following line to your config:

```
# Load oh-my-fish configuration.
source $OMF_PATH/init.fish
```

## Navigate with z


If you don't know [z](https://github.com/rupa/z), try it out immediately, it is guaranteed to change your life.
It will allow you to navigate to the most frequent directories with fuzzy commands.

For instance, issuing `z fun` would bring me to `/Users/geowarin/.configfish/functions` since it is a directory I often
visit.

To install it:

```
brew install z
```

This will install z... For bash.

This is where oh-my-fish comes into play.
Simply install the `z` plugin with:

```
omf install z
```

## Backward history search with re-search

One of the most useful features of bash is the ability to search a term in your recent history with `CTRL + R`.
This feature is not enabled by default but somebody wrote a little program called [re-search](https://github.com/jbonjean/re-search).

Follow the instructions to install it.
You will have to `git clone` it, `make`, add it to the path, add a function to fish and finally define a keyboard shortcut to
call it.

Those are really interesting steps. To add something to the path, open `~/.config/fish/config.fish` and use the
[set function]():

```
set -gx PATH $PATH ~/bin
```

This will add `~/bin` to the path, you can put `re-search` in there.

To add a function, you simply have to add files to `~/.config/fish/functions`.
The functions contained in the files of this directory will automatically be loaded by fish.

Finally you can see it is very easy to bind a function to a shortcut simply by editing `~/.config/fish/functions/fish_user_key_bindings.fish`

```
bind \cr re_search
```

## Define your own functions

The final step to your fish initiation is to define your own functions.
I might not be super fluent with bash but I was able to define my own functions when I had something repetitive to do.

One thing I like is to directly `cd` into a directory I created.
A simple solution with bash is to define a function that will do something like this:

```
function mkd() {
	mkdir -p "$@" && cd "$@"
}
```

With fish, simply create a file in `~/.config/fish/functions` and write:

```
function mkd
	mkdir -p $argv; and cd $argv
end
```

You can see that fish syntax is actually pretty simple.

Another thing I like is to define a variable linking to a binary before invoking it, like this:

```
function office
	set -l office /Applications/LibreOffice.app/Contents/MacOS/soffice
	eval $office --headless --convert-to $argv[1] --outdir (pwd) $argv[2]
end
```

This will allow you to invoke Libre Office in command line to convert a file from one format to another:

```
office docx myDoc.odt
```

A last one, invoke a web server in the current directory and open it in the browser:

```
function server
	python -m SimpleHTTPServer&
	sleep 1
	open http://localhost:8000
end
```

## Working around POSIX limitation with bash -c

In simple cases, you can get pretty far by calling bash scripts with
`bash -c`.

A tool I love is [sdkman](http://sdkman.io/), which will manage JVM-based binaries
like groovy or gradle.

Just add the following function in fish:

```
function sdk
  bash -c '. ~/.sdkman/bin/sdkman-init.sh; sdk "$@"' sdk $argv
end
```

I also wanted the current versions of the binaries managed by skdman to be in my
path so I added the following to my `config.fish`:

```
# sdkman
set PATH $PATH (find ~/.sdkman/*/current/bin -maxdepth 0)
```

## Working around POSIX limitation with bass

In most cases, you will find good plugins compatible with oh-my-fish.
If it is not the case, I have found [bass](https://github.com/edc/bass) to be
incredibly useful.

It is a simple python wrapper that will call scripts in bash and pass in and out
environment variables.

Simply git clone the project and use `make` to install it.

I have used it successfully to make [nvm](https://github.com/creationix/nvm)
compatible with fish.

For nvm, I added the following function:

```
function nvm
  bass source (brew --prefix nvm)/nvm.sh ';' nvm $argv
end
```

Here you go! I hope this will help you get started with fish.
