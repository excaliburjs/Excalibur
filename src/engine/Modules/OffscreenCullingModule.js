/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    var OffscreenCullingModule = (function () {
        function OffscreenCullingModule() {
        }
        OffscreenCullingModule.prototype.update = function (actor, engine, delta) {
            var eventDispatcher = actor.eventDispatcher;
            var anchor = actor.anchor;
            var globalScale = actor.getGlobalScale();
            var width = globalScale.x * actor.getWidth() / actor.scaleX;
            var height = globalScale.y * actor.getHeight() / actor.scaleY;
            var actorScreenCoords = engine.worldToScreenCoordinates(new ex.Point(actor.getGlobalX() - anchor.x * width, actor.getGlobalY() - anchor.y * height));

            var zoom = 1.0;
            if (engine.camera) {
                zoom = engine.camera.getZoom();
            }

            if (!actor.isOffScreen) {
                if (actorScreenCoords.x + width * zoom < 0 || actorScreenCoords.y + height * zoom < 0 || actorScreenCoords.x > engine.width || actorScreenCoords.y > engine.height) {
                    eventDispatcher.publish('exitviewport', new ex.ExitViewPortEvent());
                    actor.isOffScreen = true;
                }
            } else {
                if (actorScreenCoords.x + width * zoom > 0 && actorScreenCoords.y + height * zoom > 0 && actorScreenCoords.x < engine.width && actorScreenCoords.y < engine.height) {
                    eventDispatcher.publish('enterviewport', new ex.EnterViewPortEvent());
                    actor.isOffScreen = false;
                }
            }
        };
        return OffscreenCullingModule;
    })();
    ex.OffscreenCullingModule = OffscreenCullingModule;
})(ex || (ex = {}));
//# sourceMappingURL=OffscreenCullingModule.js.map
