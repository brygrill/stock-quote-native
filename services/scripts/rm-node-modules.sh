#!/bin/zsh
cd ..

find services -name node_modules -type d -exec rm -rf "{}" \; || true
