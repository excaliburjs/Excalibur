# Contributing

## Contributing Docs

Our docs are hosted at http://docs.excaliburjs.com and are powered by [ReadTheDocs.org](http://rtfd.org). 
Just follow the [Getting Started](http://read-the-docs.readthedocs.org/en/latest/getting_started.html) guide
to build the docs locally using Sphinx (`make html`).

## Contributing Code

1. Create or discuss an issue you wish to contribute to
2. Create a fork
3. Commit to your fork with your changes
4. Submit a pull request, making sure to reference the issue(s) you're addressing
5. Make sure it passes the CI build (all tests pass)
6. Wait for a project contributor to give you feedback
7. Once you're merged, celebrate!

Thank you for any contributions!

## Requirements

- Typescript 1.4+
- Sublime Text 2/3+
- Node.js

You will need to have the TypeScript compiler installed on your platform to build from source.

The compiler is available here:

- [Official Typescript Page](http://www.typescriptlang.org/)
- [Node Package Manager](https://npmjs.org/package/typescript)

**Note: Excalibur only supports the newest TypeScript 1.4 compiler**

### To build the engine and run the sample game on these platforms:

Using Node.js:

	npm install
  
This will install any dev dependencies in your directory.

Windows:

	grunt

Unix/Linux:
	
	grunt
