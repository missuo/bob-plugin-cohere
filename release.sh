#!/bin/bash
###
 # @Author: Vincent Young
 # @Date: 2024-04-16 15:35:13
 # @LastEditors: Vincent Young
 # @LastEditTime: 2024-04-16 17:50:16
 # @FilePath: /bob-plugin-cohere/release.sh
 # @Telegram: https://t.me/missuo
 # @GitHub: https://github.com/missuo
 # 
 # Copyright © 2024 by Vincent, All Rights Reserved. 
### 
version=${1#refs/tags/v}
zip -r -j bob-plugin-cohere-$version.bobplugin src/*

sha256_cohere=$(sha256sum bob-plugin-cohere-$version.bobplugin | cut -d ' ' -f 1)
echo $sha256_cohere

download_link="https://github.com/missuo/bob-plugin-cohere/releases/download/v$version/bob-plugin-cohere-$version.bobplugin"

new_version="{\"version\": \"$version\", \"desc\": \"None\", \"sha256\": \"$sha256_cohere\", \"url\": \"$download_link\", \"minBobVersion\": \"1.8.0\"}"

json_file='appcast.json'
json_data=$(cat $json_file)

updated_json=$(echo $json_data | jq --argjson new_version "$new_version" '.versions = [$new_version] + .versions')

echo $updated_json > $json_file
mkdir dist
mv *.bobplugin dist
