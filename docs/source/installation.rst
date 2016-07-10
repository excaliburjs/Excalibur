Installing Excalibur.js
=======================

Getting Excalibur
-----------------

There are several ways you can download Excalibur.

**Bower**::

    bower install excalibur
    
**Nuget**::

    Install-Package Excalibur
    
You can also download the raw Javascript files from the `Releases <https://github.com/excaliburjs/Excalibur/releases>`_ page.

Unstable Builds
---------------

If you want to live on the edge and get unstable builds, you can add the Excalibur Appveyor Nuget feed to your project, see :doc:`unstable`.

Referencing Excalibur in your project
-------------------------------------

Just include the ``excalibur-{version}.min.js`` file on your page and you'll be set.

If you're using TypeScript, be sure to reference the declaration file ``excalibur-{version}.d.ts`` file.

.. code-block:: html

    <!DOCTYPE html>
    <html lang="en">
        <head>
        </head>
        <body>
            <script src="excalibur-version.min.js"></script>
        </body>
    </html>

For Windows 8 & 10 projects
---------------------------

Please reference the `GitHub repository <https://github.com/excaliburjs/Excalibur>`_ for an example of using VS2013 and a WinJS application to run Excalbur.

1. Install the Excalibur Nuget package
2. Include the JS file in your WinJS layout file (e.g. ``default.html``)
3. Include a small script to new up your game (don't use ``default.js``)