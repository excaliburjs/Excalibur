# Excalibur Studio and Playground

This is the current implementation of the excalibur playground for sharing small game examples via links!

## Project Goals

* Eventually we want this to become the Excalibur Studio (a full fledged editor like Godot!) as well as the playground
* Drag and drop Actors/Entities
* More Terse Built-in Examples
* Replace the current documentation site embedded examples

## Developing Locally

* Initialize the Excalibur git submodule

    ```sh
    git submodule init
    git submodule update
    ```
* First generate the types from Excalibur git submodule

    ```sh
    # Windows
    npx tsup --loader ".glsl=text" .\Excalibur\src\engine\index.ts --dts

    # Mac / Linux
    npx tsup --loader ".glsl=text" ./Excalibur/src/engine/index.ts --dts
    ```
* Run `npm install`
* Run `npm start`

## Contribution Wishlist

* Link to source code in github (or anywhere)
* Support multiple versions of Excalibur (maybe even in progress branches?)
* Auto save to the URL on keyup
* Multiple file tree
* Implement Asset Allow List (think similar to ShaderToy)
* Save to local storage (and maybe to disk in the future)
* Migrate html/js to [Lit HTML](https://lit.dev/) components, Shoelace is https://shoelace.style/ 
  - Example: [Excalibur Dev Tools Browser Extension Repo](https://github.com/excaliburjs/excalibur-extension.git)
* Add more debug tools to interface
  - Bonus points: Refactor the dev tools browser extension to be embeddable into HTML

