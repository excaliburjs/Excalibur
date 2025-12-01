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
* Still within the `playground` directory, generate the types from the Excalibur engine

    ```sh
    # Windows
    npx tsup --loader ".glsl=text" ..\src\engine\index.ts --dts --tsconfig ..\src\engine\tsconfig.json --out-dir types

    # Mac / Linux
    npx tsup --loader '.glsl=text' ../src/engine/index.ts --dts --tsconfig ../src/engine/tsconfig.json --out-dir types
    ```

### Day to day development

* Navigate to the `playground` directory
* Run `npm start`

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

