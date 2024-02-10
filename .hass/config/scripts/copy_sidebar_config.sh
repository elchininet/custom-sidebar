#!/bin/bash

pushd www/sidebar-configs

##echo -e -n "So,$1\n" > ./log.txt
FILE="${1}.json"

rm -f ../sidebar-config.json
cp "${FILE}" ../sidebar-config.json

popd