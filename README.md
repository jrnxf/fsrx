# brx

📚(**b**)ionic (**r**)eading e(**x**)change – flow state [bionic
reading](https://bionic-reading.com/) in the terminal

[![GitHub CI
Workflow](https://github.com/coloradocolby/brx/actions/workflows/ci.yml/badge.svg)](https://github.com/coloradocolby/brx/actions/workflows/ci.yml)
[![GitHub Deploy
Workflow](https://github.com/coloradocolby/brx/actions/workflows/deploy.yml/badge.svg)](https://github.com/coloradocolby/brx/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-default.svg)](./LICENSE.md)
[![Crate
Version](https://img.shields.io/crates/v/brx)](https://crates.io/crates/brx)
[![Github
Stars](https://img.shields.io/github/stars/coloradocolby/brx)](https://github.com/coloradocolby/brx/stargazers)

![demo](https://github.com/coloradocolby/assets/raw/main/brx/demo.gif)

## Usage

For detailed usage run `brx -h`.

```
brx 0.1.1
Colby Thomas <coloradocolby@gmail.com>
📚(b)ionic (r)eading e(x)change
flow state bionic reading in the terminal

USAGE:
    brx [OPTIONS] [PATH]

ARGS:
    <PATH>    path to file (or supply input via stdin)

OPTIONS:
    -c, --contrast               high contrast
    -f, --fixation <FIXATION>    fixation intensity [default: m] [possible values: l, m, h]
    -h, --help                   Print help information
    -s, --saccade <SACCADE>      saccade intensity [default: h] [possible values: l, m, h]
    -V, --version                Print version information
```

### Examples

```sh
$ echo "the quick brown fox jumps over the lazy dog" | brx
$ brx input.txt | less
$ brx -c -fh -sl input.txt | less
```

## Installation

### Cargo

```sh
$ cargo install brx
```

### Homebrew

incoming @ [homebrew-brx](https://github.com/coloradocolby/homebrew-brx)

## Contributing

All contributions are greatly appreciated. Please keep in mind this
project is meant to be as lightweight as possible, so not every idea
will be considered.

If you have a suggestion that would make brx better, please fork the
repo and create a [pull
request](https://github.com/coloradocolby/brx/pulls). You can also
simply open an issue and select `Feature Request`

1. Fork the repo
2. Create your feature branch (`git checkout -b [your_username]/xyz`)
3. Commit your changes (`git commit -m 'add some xyz'`)
4. Rebase off main (`git fetch --all && git rebase origin/main`)
5. Push to your branch (`git push origin [your_username]/xyz`)
6. Fill out pull request template

See the [open issues](https://github.com/coloradocolby/brx/issues) for a
full list of proposed features (and known issues).

## License

Distributed under the MIT License. See [LICENSE.md](./LICENSE.md) for
more information.

## Follow

[![github](https://img.shields.io/github/followers/coloradocolby?style=social)](https://github.com/coloradocolby)
[![twitter](https://img.shields.io/twitter/follow/coloradocolby?color=white&style=social)](https://twitter.com/coloradocolby)
[![youtube](https://img.shields.io/youtube/channel/subscribers/UCEDfokz6igeN4bX7Whq49-g?style=social)](https://youtube.com/user/coloradocolby)
