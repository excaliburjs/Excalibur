![Logo](/assets/logo.png?raw=true)

[![Build Status](https://travis-ci.org/excaliburjs/Excalibur.png?branch=master)](https://travis-ci.org/excaliburjs/Excalibur)
[![Build status](https://ci.appveyor.com/api/projects/status/9i7s7dokx0uygu34?svg=true)](https://ci.appveyor.com/project/eonarheim/excalibur)
[![npm version](https://badge.fury.io/js/excalibur.png)](https://badge.fury.io/js/excalibur)
[![Bower version](https://badge.fury.io/bo/excalibur.png)](http://badge.fury.io/bo/excalibur)
[![NuGet version](https://badge.fury.io/nu/Excalibur.png)](http://badge.fury.io/nu/Excalibur)
[![Docs status](https://readthedocs.org/projects/excaliburjs/badge/?version=latest)](http://excaliburjs.readthedocs.org/en/latest/?badge=latest)

![Sweep Stacks](http://excaliburjs.com/assets/images/homepage-xp.png)

Excalibur is a simple, **free** game engine written in TypeScript for making 2D games in HTML5 canvas. Our goal with Excalibur is to make it *incredibly simple* to create and write 2D HTML/JS games aimed at folks new to game development all the way up to more experienced game developers. We take care of all the boilerplate engine code, cross-platform targeting, and more so you don't have to. Use as much or as little as you need!

Excalibur is an open source project licensed under the 2-clause BSD license (this means you can use it in commercial projects!). It's free and always will be. We welcome any feedback or contributions! If you make something with Excalbur, please [let us know](https://groups.google.com/forum/#!forum/excaliburjs) so we can feature you in our online gallery.

# Get Started

Our user documentation is at http://docs.excaliburjs.com.

- Follow our [Installation](http://docs.excaliburjs.com/en/latest/installation.html) guide to learn how to install Excalibur
- Follow our [Getting Started](http://docs.excaliburjs.com/en/latest/quickstart.html) guide if you're looking to get started.
- Learn what [Features](http://docs.excaliburjs.com/en/latest/features.html) are available for you to leverage in your games
- View the [Release roadmap](https://github.com/excaliburjs/Excalibur/milestones) to see what's coming next

Please note while we try to minimize API changes, we are still in 0.x which means breaking changes **will occur** in new
released versions.

# API Documentation

Visit the [API Documentation](http://docs.excaliburjs.com/en/latest/index.html#api-documentation) section for full annotated API documentation.

The `master` branch documentation is always available and up-to-date on our [Edge documentation site](http://excaliburjs.com/docs/api/edge).

# Questions

Ask us anything in the [Excalibur.js forum](https://groups.google.com/forum/#!forum/excaliburjs). 
If you find a bug, report it on the [GitHub issues page](https://github.com/excaliburjs/Excalibur/issues) (please review our [guidelines for reporting bugs](https://github.com/excaliburjs/Excalibur/blob/master/.github/CONTRIBUTING.md#reporting-bugs)).
You can also follow us on Twitter [@excaliburjs](http://twitter.com/excaliburjs) for updates or [read the blog](http://blog.excaliburjs.com).

# Samples

Compiled examples can be found [in the Excalibur Samples](http://excaliburjs.com/samples/).

# Contributing

Please view the [Contributing guidelines](.github/CONTRIBUTING.md). Whether you've spotted a bug, have a question, or think of a good feature, we thank you for your help!

## Environment Setup

The Excalibur.js team primarily uses [Visual Studio Code](http://code.visualstudio.com) as a platform agnostic editor to
allow the widest contributions possible. You can always use your own preferred editor of choice.

### Prerequisites

- [Node.js](https://nodejs.org/) (4.x+) & npm (tools like currently only support node 4.x+)

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
npm run compile

# Run engine tests only (does not run compile task)
npm run tests

# Compile HTML visual tests
npm run visual
```

Advanced users can optionally install `grunt-cli` and run the grunt tasks (same task names).

Local debugging is supported in vscode by installing the PhantomJS Debugger extension `iradul.debugger-for-phantomjs`

### Updating npm dependencies

When you update npm dependencies, we use [shrinkpack](https://github.com/JamieMason/shrinkpack) to pack up
and cache all npm packages.

Run the following to update the shrinkwrap when packages are updated:

```sh
# Install shrinkpack globally
npm install -g shrinkpack
# Run npm shrinkwrap and update npm_shrinkwrap.json
npm shrinkwrap --dev
# Run shrinkpack and download/update dependencies locally
shrinkpack .
```

If you run into errors with `npm shrinkwrap --dev` command, run the following:

```
npm install
npm prune
npm dedupe
npm install
npm shrinkwrap --dev
```

# License

Excalibur is open source and operates under the 2-clause BSD license:

	Copyright (c) 2014, Erik Onarheim
	All rights reserved.
	
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met: 
	
	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer. 
	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution. 
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	
	The views and conclusions contained in the software and documentation are those
	of the authors and should not be interpreted as representing official policies, 
	either expressed or implied, of the FreeBSD Project.
