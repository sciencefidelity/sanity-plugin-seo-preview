#!/usr/bin/env bash

cd "$WORKSPACE_DIR"
stylelint --formatter json --stdin-filename
