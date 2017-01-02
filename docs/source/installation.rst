Installing Excalibur.js
=======================

Getting Excalibur
-----------------

There are several ways you can download Excalibur.

**npm** (Best for TypeScript projects)::

    npm install excalibur

**Bower**::

    bower install excalibur
    
**Nuget**::

    Install-Package Excalibur

**Yeoman Generator**

You can use the `Excalibur Yeoman generator <https://github.com/excaliburjs/generator-excalibur>`_ to spin
up a blank, ready-to-go Excalibur game:

.. code-block:: bash

   # Install Yeoman globally
   npm install -g yo
   # Install the Excalibur generator globally
   npm install -g generator-excalibur
   # Create the folder you want your game to be in
   mkdir my-game
   # Go into the folder
   cd my-game
   # Run the excalibur generator
   yo excalibur

The Yeoman generator will automatically create the appropriate package.json and bower.json files and install
the needed dependencies for your project.

**Raw Script Files**

You can also download the raw Javascript files from the `Excalibur Distribution repository <https://github.com/excaliburjs/excalibur-dist/releases>`_.

.. note:: Remember, Excalibur is a client-side library and cannot be used in a server-side
          Node.js project.

Unstable Builds
---------------

If you want to live on the edge and get unstable builds, you can add the Excalibur Appveyor Nuget feed to your project, see :doc:`unstable`.

Referencing Excalibur Standalone
--------------------------------

Just include the ``excalibur.min.js`` file on your page and you'll be set.

.. code-block:: html

    <!DOCTYPE html>
    <html lang="en">
        <head>
        </head>
        <body>
            <script src="excalibur.min.js"></script>
        </body>
    </html>

Referencing Excalibur via Triple-Slash Reference
------------------------------------------------

For a simple TypeScript-based game, using triple-slash references works great. It requires
no extra module system or loaders.

.. code-block:: typescript
   
   /// <reference path="node_modules/excalibur/dist/excalibur.d.ts" />

   var game = new ex.Engine({ ... });

Make sure the path is relative to the current TS file. You only need to include the reference
on your "entrypoint" file. Then simply include ``excalibur.min.js`` as mentioned above in your 
HTML page. 

You can also reference Excalibur through the ``tsconfig.json``.

.. code-block:: javascript

   {
      "compilerOptions": {
         "target": "es5",
         "outFile": "game.js",
         "types": ["excalibur"]
      }
   }

Referencing Excalibur as a Module
---------------------------------

Excalibur is built using the `AMD <https://github.com/amdjs/amdjs-api/blob/master/AMD.md>`_ module 
system. The standalone files ``excalibur.js`` or ``excalibur.min.js`` use the 
`UMD <https://github.com/umdjs/umd>`_ module syntax at runtime to support CommonJS (Node-like), AMD, 
and a global browser fallback. It is auto-loaded into the ``ex`` global namespace. 
These are the recommended files to use for production deployments.

You can optionally use ``excalibur.amd.js`` and ``excalibur.amd.d.ts`` to load Excalibur using an
AMD-compatible loader (such as `jspm <http://jspm.io/>`_). Note that this method is harder to
reference via TypeScript.

To get started, first install Excalibur through npm (TypeScript typings are best supported in npm):

.. code-block:: bash
   
   npm install excalibur -D

In a TypeScript project, you can reference Excalibur with the ES6 import style syntax:

.. code-block:: typescript

   // Excalibur is loaded into the ex global namespace
   import * as ex from 'excalibur'

At runtime, you should still include ``excalibur.min.js`` standalone. In a module loader system,
such as `SystemJS <https://github.com/systemjs/systemjs>`_, you must mark ``excalibur`` as an 
external module.

An example SystemJS configuration:

.. code-block:: javascript

   System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',
      // excalibur in an npm module
      'excalibur': 'npm:excalibur/dist/excalibur.js'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      }
    });

Example Project Templates
-------------------------

The `excaliburjs <https://github.com/excaliburjs>`_ organization on GitHub has several example projects:

- `TypeScript, Angular2 & SystemJS <https://github.com/excaliburjs/example-ts-angular2>`_
- `TypeScript & Webpack <https://github.com/excaliburjs/example-ts-webpack>`_
- `TypeScript & Browserify <https://github.com/excaliburjs/example-ts-webpack>`_
- `Universal Windows Platform (UWP) <https://github.com/excaliburjs/example-uwp>`_
- `Apache Cordova <https://github.com/excaliburjs/example-cordova>`_