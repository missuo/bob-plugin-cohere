# bob-plugin-cohere

A [Bob](https://bobtranslate.com/) translation plugin powered by [Cohere](https://cohere.com/) AI.

## Features

- All Cohere chat models supported, with auto-fetch script to keep the list up to date
- Streaming response for real-time translation output
- Four modes: Translation, Polishing, Q&A, and Custom Prompt

## Installation

1. Install [Bob](https://apps.apple.com/cn/app/id1630034110#?platform=mac) (macOS)
2. Download the latest `.bobplugin` from [Releases](https://github.com/missuo/bob-plugin-cohere/releases)
3. Double-click to install
4. Get a free API Key from [Cohere Dashboard](https://dashboard.cohere.com/api-keys) and paste it in the plugin settings

## Development

```bash
npm install
cp .env.example .env   # then fill in your COHERE_API_KEY

npm run build           # compile TS → build/
npm run fetch-models    # pull latest models into src/info.json
bash release.sh v1.0.9  # build + package .bobplugin
```

## License

GPL-3.0 © [Vincent Young](https://github.com/missuo)
