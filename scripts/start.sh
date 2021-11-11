#!/usr/bin/env sh

trap "kill 0" EXIT

hugo server -w -D --disableFastRender &
firefox --new-window "http://localhost:1313" &

wait
