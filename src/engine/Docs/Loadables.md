## Advanced: Custom loadables

You can implement the [[Loadable]] interface to create your own custom loadables.

This is an advanced feature, as the [[Resource]] class already wraps logic around
blob/plain data for usages like JSON, configuration, levels, etc through XHR (Ajax).

However, as long as you implement the facets of a loadable, you can create your
own.
