Installing Excalibur.js
=======================

Getting Excalibur
-----------------

There are several ways you can download Excalibur.

**Bower**::

    bower install excalibur

**npm**::

    npm install excalibur
    
**Nuget**::

    Install-Package Excalibur

You can also download the raw Javascript files from the `Excalibur Distribution repository <https://github.com/excaliburjs/excalibur-dist/releases>`_.

.. note:: Remember, Excalibur is a client-side library and cannot be used in a server-side
          Node.js project.

Unstable Builds
---------------

If you want to live on the edge and get unstable builds, you can add the Excalibur Appveyor Nuget feed to your project, see :doc:`unstable`.

Referencing Excalibur in your project
-------------------------------------

Just include the ``excalibur.min.js`` file on your page and you'll be set.

If you're using TypeScript, be sure to reference the declaration file ``excalibur.d.ts`` file.

.. code-block:: html

    <!DOCTYPE html>
    <html lang="en">
        <head>
        </head>
        <body>
            <script src="excalibur.min.js"></script>
        </body>
    </html>

Referencing Excalibur via Imports
---------------------------------

Excalibur does not yet come with out-of-the-box support for ``import`` intellisense in TypeScript. 
However, until it's natively supported, you can add support yourself with a slight modification.

Modify your local copy of the distributed ``excalibur.d.ts`` file and add the following to the end:

.. code-block:: typescript

   export default ex;

This will allow you to reference Excalibur using TypeScript with the import style syntax:

.. code-block:: typescript

   import ex from 'excalibur'

You can read more about specific module syntax in the `TypeScript Handbook <http://www.typescriptlang.org/docs/handbook/modules.html>`_.

For Windows 8 & 10 projects
---------------------------

Please reference the `GitHub repository <https://github.com/excaliburjs/Excalibur>`_ for an example of using VS2013 and a WinJS application to run Excalbur.

1. Install the Excalibur Nuget package
2. Include the JS file in your WinJS layout file (e.g. ``default.html``)
3. Include a small script to new up your game (don't use ``default.js``)