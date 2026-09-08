# Website

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

In order to do our TypeDoc includes we've forked the 
[docusaurus-plugin-typedoc-plugin](https://github.com/excaliburjs/docusaurus-plugin-typedoc-api) and vendor/ it as a submodule

## Local Dev

Be sure the core excalibur types have been generated in the root directory (requires a build)

```sh
> cd .. && npm run build && cd site/
```

Initialize the submodule for the typedoc plugin

```sh
> git submodule init
> git submodule update
```

NPM install and run the dev server

```sh
> npm install
> npm run start
```


### Playground integration

While working on the docs locally, you may want to also use a local version of the Playground. 
This is easily achieved with the `PLAYGROUND_URL` environment variable. 

```sh
# Start the Playground locally:
cd playground
npm start
```

Update `site/.env`:

```sh
PLAYGROUND_URL=http://localhost:5173
```

Run the site as usual:

```sh
npm start
```
 
