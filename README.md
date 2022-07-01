![Logo](/assets/logo.png?raw=true)

[![Appveyor status](https://img.shields.io/appveyor/ci/eonarheim/excalibur/main.svg)](https://ci.appveyor.com/project/eonarheim/excalibur)
[![Coverage Status](https://coveralls.io/repos/github/excaliburjs/Excalibur/badge.svg?branch=main)](https://coveralls.io/github/excaliburjs/Excalibur?branch=main)
[![npm version](https://img.shields.io/npm/v/excalibur.svg)](https://www.npmjs.com/package/excalibur)
[![npm downloads](https://img.shields.io/npm/dt/excalibur.svg)](https://www.npmjs.com/package/excalibur)
[![NuGet version](https://img.shields.io/nuget/v/Excalibur.svg)](https://www.nuget.org/packages/Excalibur/)

![Sweep Stacks](http://excaliburjs.com/assets/images/homepage-xp.png)

Excalibur is a free game engine written in TypeScript for making 2D games in HTML5 canvas. Our goal is to make it easier for you to create 2D HTML/JS games, whether you're new to game development or you're an experienced game developer. We take care of all of the boilerplate engine code, cross-platform targeting (using [browserstack](http://browserstack.com/) 😎), and more! Use as much or as little as you need!

Excalibur is an open source project licensed under the 2-clause BSD license (this means you can use it in commercial projects!). It's free and always will be. We welcome any feedback or contributions! If you make something with Excalibur, please [let us know](https://github.com/excaliburjs/Excalibur/discussions?discussions_q=category%3A%22Show+and+tell%22)!

# Get Started

Our user documentation is at https://excaliburjs.com/docs (and you can contribute to the docs at https://github.com/excaliburjs/excaliburjs.github.io)

- Follow our [Installation](https://excaliburjs.com/docs/installation) guide to learn how to install Excalibur.
- Follow our [Getting Started](https://excaliburjs.com/docs/getting-started) guide if you're looking to get started.
- Learn what [Features](https://excaliburjs.com/docs) are available for you to leverage in your games.
- View the [1.0 Release roadmap](https://github.com/excaliburjs/Excalibur/issues/1161) to see what's coming next.

:exclamation: **_Note:_** Excalibur is still in version 0.x, which means this project and its associated plugins may be a little rough around the edges. We try to minimize API changes, but breaking changes **will occur** in new released versions. Excalibur is a labor of love and the product of many hours of spare time. Thanks for checking it out!

# API Reference

Visit the [API Reference](https://excaliburjs.com/docs/api/edge) section for fully-annotated documentation of the API.

# Questions

- :question: Ask us anything in the [GitHub Discussions area](https://github.com/excaliburjs/Excalibur/discussions).
- :bug: If you find a bug, report it on the [GitHub issues page](https://github.com/excaliburjs/Excalibur/issues) (please review our [guidelines for reporting bugs](https://github.com/excaliburjs/Excalibur/blob/main/.github/CONTRIBUTING.md#reporting-bugs)).
- :mega: You can also follow us on Twitter [@excaliburjs](http://twitter.com/excaliburjs) or [read the blog](http://blog.excaliburjs.com).

# Samples

Compiled examples can be found [in the Excalibur Samples collection](http://excaliburjs.com/samples/).

# Contributing

Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) and our [Code of Conduct](.github/CODE_OF_CONDUCT.md). Whether you've spotted a bug, have a question, or think of a new feature, we thank you for your help!

## Mac

Prerequisites
* Docker for Mac https://docs.docker.com/desktop/mac/install/
* In the root, run `docker-compose build` (setup build environment and installs dependencies, only needed once)
* To run tests in watch mode `docker-compose run --rm dev npm run test:watch`
* To run a build `docker-compose run --rm dev npm run all`

# Writing Documentation

We love when people help improve our documentation. You can contribute to the docs in [this repository](https://github.com/excaliburjs/excaliburjs.github.io).

## Environment Setup

The Excalibur.js team primarily uses [Visual Studio Code](http://code.visualstudio.com) as a platform agnostic editor to
allow the widest contributions possible. However, you can always use your own preferred editor.

## Testing

[![Browserstack](/assets/browserstack-logo-150x34.png?raw=true)](http://browserstack.com/)

Excalibur is committed to supporting the latest 2 versions of popular desktop and mobile browsers. We leverage [browserstack](http://browserstack.com/) automated testing to ensure that Excalibur is automatically tested as thoroughly as possible on all our supported platforms.

### Prerequisites

- **Required:** [Node.js](https://nodejs.org/) 14.x & npm 6.x
- _Recommended:_ [Prettier plugin for VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- _Recommended:_ [ESLint plugin for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

After cloning the repository, run:

```sh
npm install
```

You can then run the npm tasks for various purposes:

```bash
# Run compilation, linting, and all unit & visual tests
# Recommend to do this before finalizing pull requests
npm run all

# Run engine core compilation only
# Useful for quick checks to ensure everything compiles
npm run build

# Run engine tests only (does not run compile task)
# Useful to run tests ad-hoc
npm test
npm run test

# Start Storybook-based sandbox
# Used for creating interactive visual tests and examples for docs
npm run sandbox

# Compile API docs
npm run apidocs

# Build a nuget package and specify a version
npm run nuget -- 1.1.1
```

# License

Excalibur is open source and operates under the 2-clause BSD license:

    BSD 2-Clause License

    Copyright (c) 2014, Erik Onarheim
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this
      list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
