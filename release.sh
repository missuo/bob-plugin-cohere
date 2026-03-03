#!/bin/bash
version=${1#refs/tags/v}

# Install dependencies and build
npm ci
npm run build

# Package from build directory
zip -r -j bob-plugin-cohere-$version.bobplugin build/*

sha256_cohere=$(sha256sum bob-plugin-cohere-$version.bobplugin | cut -d ' ' -f 1)
echo $sha256_cohere

download_link="https://github.com/missuo/bob-plugin-cohere/releases/download/v$version/bob-plugin-cohere-$version.bobplugin"

new_version="{\"version\": \"$version\", \"desc\": \"None\", \"sha256\": \"$sha256_cohere\", \"url\": \"$download_link\", \"minBobVersion\": \"1.8.0\"}"

json_file='appcast.json'
json_data=$(cat $json_file)

updated_json=$(echo $json_data | jq --argjson new_version "$new_version" '.versions = [$new_version] + .versions')

echo $updated_json > $json_file
mkdir -p dist
mv *.bobplugin dist
