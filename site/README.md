# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.


#### Playground integration

While working on the docs locally, you may want to also use a local version of the Playground. 
This is easily achieved with the `PLAYGROUND_URL` environment variable. 

```sh
# Start the Playground locally:
cd playground
npm run start
```

Update `site/.env`:

```sh
PLAYGROUND_URL=http://localhost:5173
```

Run the site as usual:

```sh
yarn start
```
 



### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
