#!/bin/bash

pushd www/custom-sidebar-configs

##echo -e -n "So,$1\n" > ./log.txt
FILE="${1}.json"

rm -f ../custom-sidebar-config.json
cp "${FILE}" ../custom-sidebar-config.json

popd