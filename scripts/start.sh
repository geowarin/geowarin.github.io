#!/usr/bin/env sh

trap "kill 0" EXIT

hugo server -w -D --disableFastRender &
sleep 1 && firefox --new-window "http://localhost:1313" &

wait
