# Excalibur Studio and Playground

This is the current implementation of the Excalibur Playground for sharing small game examples via links!

## Project Goals

* Eventually we want this to become the Excalibur Studio (a full fledged editor like Godot!) as well as the Playground
* Drag and drop Actors/Entities
* More Terse Built-in Examples


## Developing Locally

### Initial setup

* From the root of the project, run `npm install` 
* Navigate to the `playground` directory, run `npm install`
* Still within the `playground` directory, generate the Excalibur engine types: 

```sh
npm run build:types
```

### Day to day development

* Navigate to the `playground` directory
* Run `npm start`

### Building locally 

The Playground lives as a standalone app at https://excaliburjs.com/playground/ , while the main site, running at https://excaliburjs.com is built with Docusaurus. 
The routing to the Playground is handled with Cloudflare rules. 

Because of this, care needs to be taken with pathing to static assets within the Playground, such as images and javascript. 
A [relative base](https://vite.dev/guide/build#relative-base) is configured in `vite.config.ts` to handle most typical scenarios. 

You can test that the built Playground operates correctly in a subdirectory:

```sh
# build to `dist/playground`, instead of the default `playground`
npm run build:dev 

# serve the locally built version on http://localhost:8080/playground
npx http-server dist
```

Open [http://localhost:8080/playground](http://localhost:8080/playground) and ensure styles, scripts, and assets load correctly. 

### Production

In production, the `BASE_URL` is overridden to route requests properly to `https://excaliburjs.com/playground`.

You can also test this locally:

```sh
BASE_URL=/playground npm start
```


## Contribution Wishlist

* Support multiple versions of Excalibur (maybe even in progress branches?)
* Auto save to the URL on keyup
* Multiple file tree
* Implement Asset Allow List (think similar to ShaderToy)
* Save to local storage (and maybe to disk in the future)
* Migrate html/js to [Lit HTML](https://lit.dev/) components, Shoelace is https://shoelace.style/ 
  - Example: [Excalibur Dev Tools Browser Extension Repo](https://github.com/excaliburjs/excalibur-extension.git)
* Add more debug tools to interface
  - Bonus points: Refactor the dev tools browser extension to be embeddable into HTML

