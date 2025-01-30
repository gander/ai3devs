# AI Devs 3

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Install

```shell
bun install
```

## Run

```shell
bun run app S00E00/app.js
```

## Install git hooks

```shell
lefthook install -f
```

### Troubleshooting

> bunx: not found

Config in `lefthook.yml`:

```yaml
rc: ~/.lefthookrc
```

Refers `~/.lefthookrc`:

```shell
PATH=$PATH:$HOME/.bun/bin
```
