#!/usr/bin/env bash

name=$@

#zenity --title "Blog title" --entry --text "Blog title?"
slug=$(echo "$@" | tr -s ' ' | tr ' A-Z' '-a-z' | tr -s '-' | tr -c '[:alnum:][:cntrl:].' '-')
hugo new --kind post-bundle "post/$slug"
idea "content/post/$slug/index.md"
