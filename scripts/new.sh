#!/usr/bin/env bash

if [ "$#" -ne 0 ]; then
    post_name="$@"
else
    post_name=$(zenity --entry --title="Blog Name" --text="Please enter the blog post name:")
fi

slug=$(echo "$post_name" | tr -s ' ' | tr ' A-Z' '-a-z' | tr -s '-' | tr -c '[:alnum:][:cntrl:].' '-')
hugo new --kind post-bundle "post/$slug"
idea "content/post/$slug/index.md"
